<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'wordpress_id',
        'category_id',
        'sub_category_id',
        'brand_id',
        'event_id',
        'name',
        'slug',
        'sku',
        'product_type', 'selling_method', 'physical_length', 'physical_width', 'physical_height', 'physical_weight', 'dimension_unit', 'weight_unit',
        'price',
        'discount_price',
        'stock',
        'is_in_stock',
        'requires_paid_shipping',
        'description',
        'short_description',
        'seo_title',
        'seo_description',
        'source_url',
        'image_path',
        'is_active',
    ];

    protected $appends = [
        'image_url',
        'image_urls',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'discount_price' => 'decimal:2',
            'stock' => 'integer',
            'is_in_stock' => 'boolean',
            'requires_paid_shipping' => 'boolean',
            'is_active' => 'boolean',
            'physical_length' => 'decimal:3', 'physical_width' => 'decimal:3', 'physical_height' => 'decimal:3', 'physical_weight' => 'decimal:3',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Product $product): void {
            if ($product->isDirty('is_in_stock')) {
                $product->stock = $product->is_in_stock
                    ? max(1, (int) $product->stock)
                    : 0;

                return;
            }

            if ($product->isDirty('stock')) {
                $product->is_in_stock = (int) $product->stock > 0;
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function subCategory(): BelongsTo
    {
        return $this->belongsTo(SubCategory::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function scopeWithCurrentOffer(Builder $query, $at = null): Builder
    {
        return $query
            ->whereNotNull('discount_price')
            ->where('discount_price', '>', 0)
            ->whereColumn('discount_price', '<', 'price')
            ->where(function (Builder $offerQuery) use ($at): void {
                $offerQuery
                    ->whereNull('event_id')
                    ->orWhereHas('event', fn (Builder $eventQuery) => $eventQuery->currentlyActive($at));
            });
    }

    public function currentDiscountPrice(): ?float
    {
        return $this->resolveCurrentDiscountPrice($this->getRawOriginal('discount_price'));
    }

    public function effectiveUnitPrice(): float
    {
        return $this->currentDiscountPrice() ?? max(0, (float) $this->getRawOriginal('price'));
    }

    public function getDiscountPriceAttribute($value): ?string
    {
        $discount = $this->resolveCurrentDiscountPrice($value);

        return $discount === null ? null : number_format($discount, 2, '.', '');
    }

    private function resolveCurrentDiscountPrice($value): ?float
    {
        $discount = (float) ($value ?? 0);
        $price = (float) ($this->getRawOriginal('price') ?? 0);

        if ($discount <= 0 || $price <= 0 || $discount >= $price) {
            return null;
        }

        if ($this->event_id !== null) {
            $event = $this->relationLoaded('event')
                ? $this->getRelation('event')
                : $this->event()->first();

            if (! $event?->isCurrentlyActive()) {
                return null;
            }
        }

        return round($discount, 2);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function faqs(): HasMany
    {
        return $this->hasMany(ProductFaq::class)->orderBy('sort_order');
    }

    public function colors(): BelongsToMany
    {
        return $this->belongsToMany(Color::class)->withPivot('product_image_id');
    }

    public function measurements(): BelongsToMany
    {
        return $this->belongsToMany(Measurement::class)->withPivot(['value', 'unit']);
    }

    public function sizeOptions(): BelongsToMany
    {
        return $this->belongsToMany(SizeOption::class)->withPivot('sort_order')->orderByPivot('sort_order');
    }

    public function flooringDetail(): \Illuminate\Database\Eloquent\Relations\HasOne { return $this->hasOne(ProductFlooringDetail::class); }
    public function wallpaperDetail(): \Illuminate\Database\Eloquent\Relations\HasOne { return $this->hasOne(ProductWallpaperDetail::class); }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function favoritedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'favorites')->withTimestamps();
    }

    public function getImageUrlAttribute(): ?string
    {
        $firstImage = $this->relationLoaded('images')
            ? $this->images->first()
            : $this->images()->first();

        if ($firstImage) {
            return $firstImage->url;
        }

        if ($this->image_path) {
            return Storage::disk('public')->url($this->image_path);
        }

        return null;
    }

    public function getImageUrlsAttribute(): array
    {
        if ($this->relationLoaded('images')) {
            return $this->images->pluck('url')->values()->all();
        }

        return $this->images()->get()->pluck('url')->values()->all();
    }
}
