<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'slug', 'project_type', 'location', 'client_name', 'area', 'completed_at',
        'summary', 'content', 'services', 'materials', 'cover_image_path', 'cover_image_alt',
        'status', 'is_featured', 'published_at', 'sort_order', 'meta_title', 'meta_description',
    ];

    protected $appends = ['cover_image_url'];

    protected function casts(): array
    {
        return [
            'completed_at' => 'date',
            'services' => 'array',
            'materials' => 'array',
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProjectImage::class)->orderBy('sort_order')->orderBy('id');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('status', 'published')
            ->where(function (Builder $publishedQuery): void {
                $publishedQuery->whereNull('published_at')->orWhere('published_at', '<=', now());
            });
    }

    public function getCoverImageUrlAttribute(): ?string
    {
        return $this->cover_image_path ? Storage::disk('public')->url($this->cover_image_path) : null;
    }
}
