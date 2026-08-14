<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Event;
use App\Models\Product;
use App\Models\SubCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class PublicOffersApiTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_public_offer_feed_combines_manual_and_current_event_discounts(): void
    {
        Carbon::setTestNow('2026-08-11 12:00:00');
        [$category, $subCategory] = $this->catalogueRelations();

        $activeEvent = Event::create([
            'name' => 'Summer Living',
            'discount_type' => 'percent',
            'discount_value' => 20,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addDay(),
            'is_active' => true,
        ]);
        $expiredEvent = Event::create([
            'name' => 'Expired Event',
            'discount_type' => 'percent',
            'discount_value' => 20,
            'starts_at' => now()->subDays(3),
            'ends_at' => now()->subMinute(),
            'is_active' => true,
        ]);
        $futureEvent = Event::create([
            'name' => 'Future Event',
            'discount_type' => 'percent',
            'discount_value' => 20,
            'starts_at' => now()->addDay(),
            'ends_at' => now()->addDays(2),
            'is_active' => true,
        ]);

        $manual = $this->offerProduct($category, $subCategory, 'Manual Offer', null, 70);
        $active = $this->offerProduct($category, $subCategory, 'Active Event Offer', $activeEvent, 80);
        $expired = $this->offerProduct($category, $subCategory, 'Expired Event Offer', $expiredEvent, 80);
        $future = $this->offerProduct($category, $subCategory, 'Future Event Offer', $futureEvent, 80);
        $outOfStock = $this->offerProduct($category, $subCategory, 'Unavailable Offer', null, 60, false);

        $response = $this->getJson('/api/public/offers?per_page=12');

        $response
            ->assertOk()
            ->assertJsonPath('meta.total', 2)
            ->assertJsonPath('events.0.id', $activeEvent->id)
            ->assertJsonCount(2, 'data');

        $ids = collect($response->json('data'))->pluck('id');
        $this->assertTrue($ids->contains($manual->id));
        $this->assertTrue($ids->contains($active->id));
        $this->assertFalse($ids->contains($expired->id));
        $this->assertFalse($ids->contains($future->id));
        $this->assertFalse($ids->contains($outOfStock->id));

        $this->getJson('/api/public/offers/summary')
            ->assertOk()
            ->assertJson(['has_offers' => true, 'count' => 2]);

        $this->getJson('/api/public/events')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $activeEvent->id);
    }

    public function test_expired_event_price_is_not_used_as_the_customer_price(): void
    {
        Carbon::setTestNow('2026-08-11 12:00:00');
        [$category, $subCategory] = $this->catalogueRelations();
        $event = Event::create([
            'name' => 'Finished Event',
            'discount_type' => 'fixed',
            'discount_value' => 25,
            'starts_at' => now()->subDays(2),
            'ends_at' => now()->subMinute(),
            'is_active' => true,
        ]);
        $product = $this->offerProduct($category, $subCategory, 'Finished Offer Product', $event, 75);

        $this->assertNull($product->fresh()->discount_price);
        $this->assertSame(100.0, $product->fresh()->effectiveUnitPrice());

        $this->getJson('/api/public/products/'.$product->slug)
            ->assertOk()
            ->assertJsonPath('discount_price', null);
    }

    private function catalogueRelations(): array
    {
        $category = Category::create([
            'name' => 'Furniture',
            'slug' => 'furniture',
            'is_active' => true,
        ]);
        $subCategory = SubCategory::create([
            'category_id' => $category->id,
            'name' => 'Chairs',
            'slug' => 'chairs',
            'is_active' => true,
        ]);

        return [$category, $subCategory];
    }

    private function offerProduct(
        Category $category,
        SubCategory $subCategory,
        string $name,
        ?Event $event,
        float $discountPrice,
        bool $inStock = true,
    ): Product {
        return Product::create([
            'category_id' => $category->id,
            'sub_category_id' => $subCategory->id,
            'event_id' => $event?->id,
            'name' => $name,
            'slug' => str($name)->slug(),
            'price' => 100,
            'discount_price' => $discountPrice,
            'stock' => $inStock ? 5 : 0,
            'is_in_stock' => $inStock,
            'is_active' => true,
        ]);
    }
}
