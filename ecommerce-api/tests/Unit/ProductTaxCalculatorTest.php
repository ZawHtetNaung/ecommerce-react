<?php

namespace Tests\Unit;

use App\Models\Product;
use App\Services\ProductTaxCalculator;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class ProductTaxCalculatorTest extends TestCase
{
    #[DataProvider('taxCases')]
    public function test_it_calculates_the_configured_tax_treatment(
        string $taxStatus,
        string $taxClass,
        int $expectedTaxAdded,
        int $expectedTaxIncluded,
        int $expectedPayable,
    ): void {
        $product = new Product;
        $product->setRawAttributes([
            'price' => 100,
            'discount_price' => 80,
            'tax_status' => $taxStatus,
            'tax_class' => $taxClass,
        ], true);

        $pricing = (new ProductTaxCalculator)->line($product, 2);

        $this->assertSame(20000, $pricing['regular_subtotal_cents']);
        $this->assertSame(16000, $pricing['subtotal_cents']);
        $this->assertSame(4000, $pricing['discount_cents']);
        $this->assertSame($expectedTaxAdded, $pricing['tax_added_cents']);
        $this->assertSame($expectedTaxIncluded, $pricing['tax_included_cents']);
        $this->assertSame($expectedPayable, $pricing['payable_cents']);
    }

    public static function taxCases(): array
    {
        return [
            'standard adds five percent' => ['taxable', 'standard', 800, 0, 16800],
            'zero rate discloses embedded five percent' => ['taxable', 'zero_rate', 0, 762, 16000],
            'no tax has no vat' => ['none', 'standard', 0, 0, 16000],
        ];
    }
}
