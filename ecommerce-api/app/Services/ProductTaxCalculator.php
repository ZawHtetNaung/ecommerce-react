<?php

namespace App\Services;

use App\Models\Product;

final class ProductTaxCalculator
{
    public const VAT_RATE = 5;

    /**
     * Standard products add VAT to the entered price. Zero-rate source products use the
     * business rule that VAT is already embedded in the entered price. No-tax products
     * neither add nor disclose VAT.
     *
     * @return array<string, int|bool|string>
     */
    public function line(Product $product, int $quantity): array
    {
        $quantity = max(1, $quantity);
        $regularUnitCents = $this->moneyToCents($product->getRawOriginal('price'));
        $effectiveUnitCents = $this->moneyToCents($product->effectiveUnitPrice());
        $regularSubtotalCents = $regularUnitCents * $quantity;
        $subtotalCents = $effectiveUnitCents * $quantity;
        $discountCents = max(0, $regularSubtotalCents - $subtotalCents);
        $taxStatus = $product->tax_status === 'none' ? 'none' : 'taxable';
        $taxClass = $product->tax_class === 'zero_rate' ? 'zero_rate' : 'standard';
        $taxAddedCents = 0;
        $taxIncludedCents = 0;

        if ($taxStatus === 'taxable' && $taxClass === 'standard') {
            $taxAddedCents = (int) round($subtotalCents * self::VAT_RATE / 100);
        } elseif ($taxStatus === 'taxable' && $taxClass === 'zero_rate') {
            $taxIncludedCents = (int) round($subtotalCents * self::VAT_RATE / (100 + self::VAT_RATE));
        }

        return [
            'regular_unit_price_cents' => $regularUnitCents,
            'unit_price_cents' => $effectiveUnitCents,
            'regular_subtotal_cents' => $regularSubtotalCents,
            'subtotal_cents' => $subtotalCents,
            'discount_cents' => $discountCents,
            'tax_status' => $taxStatus,
            'tax_class' => $taxClass,
            'tax_cents' => $taxAddedCents + $taxIncludedCents,
            'tax_added_cents' => $taxAddedCents,
            'tax_included_cents' => $taxIncludedCents,
            'tax_is_included' => $taxIncludedCents > 0,
            'payable_cents' => $subtotalCents + $taxAddedCents,
        ];
    }

    public function moneyToCents(mixed $amount): int
    {
        $normalized = number_format(max(0, (float) $amount), 2, '.', '');
        [$whole, $fraction] = explode('.', $normalized, 2);

        return ((int) $whole * 100) + (int) $fraction;
    }

    public function formatMoney(int $amountCents): string
    {
        return number_format($amountCents / 100, 2, '.', '');
    }
}
