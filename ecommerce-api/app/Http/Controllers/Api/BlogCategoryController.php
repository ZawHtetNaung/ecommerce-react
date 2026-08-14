<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class BlogCategoryController extends Controller
{
    public function publicIndex()
    {
        return response()->json(
            BlogCategory::query()->where('is_active', true)->withCount(['posts' => fn ($query) => $query->published()])->orderBy('name')->get()
        );
    }

    public function index()
    {
        return response()->json(BlogCategory::query()->withCount('posts')->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $this->validated($request);
        $validated['slug'] = $this->uniqueSlug($validated['slug'] ?? $validated['name']);
        $category = BlogCategory::create($validated);
        return response()->json(['message' => 'Blog category created successfully.', 'category' => $category], 201);
    }

    public function show(BlogCategory $blogCategory)
    {
        return response()->json($blogCategory->loadCount('posts'));
    }

    public function update(Request $request, BlogCategory $blogCategory)
    {
        $validated = $this->validated($request, $blogCategory);
        $validated['slug'] = $this->uniqueSlug($validated['slug'] ?? $validated['name'], $blogCategory->id);
        $blogCategory->update($validated);
        return response()->json(['message' => 'Blog category updated successfully.', 'category' => $blogCategory->fresh()]);
    }

    public function destroy(BlogCategory $blogCategory)
    {
        $blogCategory->delete();
        return response()->json(['message' => 'Blog category deleted successfully.']);
    }

    private function validated(Request $request, ?BlogCategory $category = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('blog_categories', 'slug')->ignore($category?->id)],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['nullable', 'boolean'],
        ]);
    }

    private function uniqueSlug(string $value, ?int $ignoreId = null): string
    {
        $base = Str::slug($value) ?: 'category';
        $slug = $base;
        $suffix = 2;
        while (BlogCategory::where('slug', $slug)->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))->exists()) {
            $slug = $base.'-'.$suffix++;
        }
        return $slug;
    }
}
