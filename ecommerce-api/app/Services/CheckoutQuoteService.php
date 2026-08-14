<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Collection;

final class CheckoutQuoteService
{
    public function __construct(
        private readonly ShippingQuoteCalculator $shippingCalculator,
        private readonly ProductTaxCalculator $taxCalculator,
    ) {}

    /**
     * @param  Collection<int, array{product: Product|null, quantity: int}>  $lines
     * @return array<string, mixed>|null
     */
    public function build(Collection $lines, string $zoneCode): ?array
    {
        $availableLines = $lines->filter(function (array $line): bool {
            $product = $line['product'];

            return $product instanceof Product
                && $product->is_active
                && $product->is_in_stock
                && $product->stock >= $line['quantity'];
        });

        if ($availableLines->isEmpty()) {
            return null;
        }

        $priceLines = $availableLines->map(fn (array $line): array => $this->taxCalculator->line(
            $line['product'],
            (int) $line['quantity']
        ));
        $regularSubtotalCents = (int) $priceLines->sum('regular_subtotal_cents');
        $subtotalCents = (int) $priceLines->sum('subtotal_cents');
        $discountCents = (int) $priceLines->sum('discount_cents');
        $taxAddedCents = (int) $priceLines->sum('tax_added_cents');
        $taxIncludedCents = (int) $priceLines->sum('tax_included_cents');
        $taxCents = $taxAddedCents + $taxIncludedCents;

        $requiresPaidShipping = $availableLines->contains(function (array $line): bool {
            $product = $line['product'];

            return $product->requires_paid_shipping
                || $product->category?->slug === 'special-collection';
        });

        $shippingQuote = $this->shippingCalculator->calculate(
            $subtotalCents,
            $zoneCode,
            $requiresPaidShipping
        );
        $hasUnavailableItems = $lines->count() !== $availableLines->count();

        return [
            'can_checkout' => ! $hasUnavailableItems,
            'currency' => $shippingQuote['currency'],
            'zone' => $shippingQuote['zone'],
            'cart' => [
                'available_line_count' => $availableLines->count(),
                'available_item_count' => $availableLines->sum('quantity'),
                'unavailable_line_count' => $lines->count() - $availableLines->count(),
                'has_unavailable_items' => $hasUnavailableItems,
                'requires_paid_shipping' => $requiresPaidShipping,
            ],
            'regular_subtotal' => $this->taxCalculator->formatMoney($regularSubtotalCents),
            'discount' => $this->taxCalculator->formatMoney($discountCents),
            'subtotal' => $this->taxCalculator->formatMoney($subtotalCents),
            'tax' => [
                'applies' => $priceLines->contains(fn (array $line): bool => $line['tax_status'] === 'taxable'),
                'rate' => ProductTaxCalculator::VAT_RATE,
                'amount' => $this->taxCalculator->formatMoney($taxCents),
                'added_amount' => $this->taxCalculator->formatMoney($taxAddedCents),
                'included_amount' => $this->taxCalculator->formatMoney($taxIncludedCents),
            ],
            'shipping' => [
                'label' => $shippingQuote['shipping']['label'],
                'amount' => $this->taxCalculator->formatMoney($shippingQuote['shipping']['fee_cents']),
                'tax' => $this->taxCalculator->formatMoney($shippingQuote['shipping']['tax_cents']),
                'is_free' => $shippingQuote['shipping']['is_free'],
                'paid_shipping_override' => $shippingQuote['shipping']['paid_shipping_override'],
                'free_shipping_threshold_applies' => $shippingQuote['shipping']['free_shipping_threshold_applies'],
                'free_shipping_threshold' => $this->formatNullableMoney(
                    $shippingQuote['shipping']['free_shipping_threshold_cents']
                ),
                'amount_until_free_shipping' => $this->formatNullableMoney(
                    $shippingQuote['shipping']['amount_until_free_shipping_cents']
                ),
            ],
            'total' => $this->taxCalculator->formatMoney($shippingQuote['total_cents'] + $taxAddedCents),
        ];
    }

    private function formatNullableMoney(?int $amountCents): ?string
    {
        return $amountCents === null ? null : $this->taxCalculator->formatMoney($amountCents);
    }
}
