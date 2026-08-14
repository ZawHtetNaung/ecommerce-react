<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProjectController extends Controller
{
    private const TYPES = ['residential', 'commercial', 'hospitality', 'office'];

    public function publicIndex(Request $request)
    {
        $perPage = min(max($request->integer('per_page', 12), 1), 24);
        $projects = Project::query()
            ->published()
            ->with('images')
            ->when($request->filled('type'), fn ($query) => $query->where('project_type', $request->query('type')))
            ->when($request->boolean('featured'), fn ($query) => $query->where('is_featured', true))
            ->orderByDesc('is_featured')
            ->orderBy('sort_order')
            ->orderByDesc('completed_at')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'data' => $projects->items(),
            'meta' => [
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
                'per_page' => $projects->perPage(),
                'total' => $projects->total(),
            ],
            'types' => self::TYPES,
        ]);
    }

    public function publicShow(string $slug)
    {
        return response()->json(
            Project::query()->published()->where('slug', $slug)->with('images')->firstOrFail()
        );
    }

    public function index()
    {
        return response()->json(Project::query()->with('images')->orderBy('sort_order')->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $this->validateProject($request);
        $validated['slug'] = $this->uniqueSlug($validated['slug'] ?? $validated['title']);
        $validated['published_at'] = $this->publishedAt($validated);

        if ($request->hasFile('cover_image')) {
            $validated['cover_image_path'] = $request->file('cover_image')->store('projects/covers', 'public');
        }

        $project = Project::create($this->projectData($validated));
        $this->storeGallery($request, $project);

        return response()->json([
            'message' => 'Project created successfully.',
            'project' => $project->load('images'),
        ], 201);
    }

    public function show(Project $project)
    {
        return response()->json($project->load('images'));
    }

    public function update(Request $request, Project $project)
    {
        $validated = $this->validateProject($request, $project);
        $validated['slug'] = $this->uniqueSlug($validated['slug'] ?? $validated['title'], $project->id);
        $validated['published_at'] = $this->publishedAt($validated, $project);

        if ($request->hasFile('cover_image')) {
            if ($project->cover_image_path) Storage::disk('public')->delete($project->cover_image_path);
            $validated['cover_image_path'] = $request->file('cover_image')->store('projects/covers', 'public');
        }

        $project->update($this->projectData($validated));
        $this->storeGallery($request, $project);

        return response()->json([
            'message' => 'Project updated successfully.',
            'project' => $project->fresh()->load('images'),
        ]);
    }

    public function destroy(Project $project)
    {
        if ($project->cover_image_path) Storage::disk('public')->delete($project->cover_image_path);
        foreach ($project->images as $image) Storage::disk('public')->delete($image->path);
        $project->delete();

        return response()->json(['message' => 'Project deleted successfully.']);
    }

    public function destroyImage(Project $project, ProjectImage $image)
    {
        abort_unless($image->project_id === $project->id, 404);
        Storage::disk('public')->delete($image->path);
        $image->delete();

        return response()->json(['message' => 'Project image deleted successfully.']);
    }

    private function validateProject(Request $request, ?Project $project = null): array
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('projects', 'slug')->ignore($project?->id)],
            'project_type' => ['required', Rule::in(self::TYPES)],
            'location' => ['nullable', 'string', 'max:255'],
            'client_name' => ['nullable', 'string', 'max:255'],
            'area' => ['nullable', 'string', 'max:255'],
            'completed_at' => ['nullable', 'date'],
            'summary' => ['nullable', 'string', 'max:3000'],
            'content' => ['nullable', 'string'],
            'services' => ['nullable', 'array'],
            'services.*' => ['string', 'max:255'],
            'services_json' => ['nullable', 'json'],
            'materials' => ['nullable', 'array'],
            'materials.*' => ['string', 'max:255'],
            'materials_json' => ['nullable', 'json'],
            'cover_image' => ['nullable', 'image', 'max:5120'],
            'cover_image_alt' => ['nullable', 'string', 'max:255'],
            'gallery_images' => ['nullable', 'array', 'max:20'],
            'gallery_images.*' => ['image', 'max:5120'],
            'gallery_alt_texts' => ['nullable', 'array'],
            'gallery_alt_texts.*' => ['nullable', 'string', 'max:255'],
            'status' => ['required', Rule::in(['draft', 'published'])],
            'is_featured' => ['nullable', 'boolean'],
            'published_at' => ['nullable', 'date'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:1000'],
        ]);

        if (array_key_exists('services_json', $validated)) {
            $validated['services'] = collect(json_decode($validated['services_json'] ?: '[]', true))->filter(fn ($item) => is_string($item) && trim($item) !== '')->values()->all();
        }
        if (array_key_exists('materials_json', $validated)) {
            $validated['materials'] = collect(json_decode($validated['materials_json'] ?: '[]', true))->filter(fn ($item) => is_string($item) && trim($item) !== '')->values()->all();
        }

        return $validated;
    }

    private function projectData(array $validated): array
    {
        return collect($validated)->only([
            'title', 'slug', 'project_type', 'location', 'client_name', 'area', 'completed_at',
            'summary', 'content', 'services', 'materials', 'cover_image_path', 'cover_image_alt',
            'status', 'is_featured', 'published_at', 'sort_order', 'meta_title', 'meta_description',
        ])->merge([
            'is_featured' => $validated['is_featured'] ?? false,
            'sort_order' => $validated['sort_order'] ?? 0,
        ])->all();
    }

    private function storeGallery(Request $request, Project $project): void
    {
        $files = $request->file('gallery_images', []);
        $altTexts = $request->input('gallery_alt_texts', []);
        $startOrder = (int) ($project->images()->max('sort_order') ?? -1) + 1;

        foreach ($files as $index => $file) {
            $project->images()->create([
                'path' => $file->store('projects/gallery', 'public'),
                'alt_text' => $altTexts[$index] ?? $project->title,
                'sort_order' => $startOrder + $index,
            ]);
        }
    }

    private function publishedAt(array $validated, ?Project $project = null)
    {
        if (($validated['status'] ?? 'draft') !== 'published') return $validated['published_at'] ?? null;
        return $validated['published_at'] ?? $project?->published_at ?? now();
    }

    private function uniqueSlug(string $value, ?int $ignoreId = null): string
    {
        $base = Str::slug($value) ?: 'project';
        $slug = $base;
        $suffix = 2;
        while (Project::where('slug', $slug)->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))->exists()) {
            $slug = $base.'-'.$suffix++;
        }
        return $slug;
    }
}
