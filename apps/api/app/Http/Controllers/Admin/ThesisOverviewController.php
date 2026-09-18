<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Thesis;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ThesisOverviewController extends Controller
{
    /**
     * List all student theses for super admin (read-only).
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $status = $request->query('status');

        $query = Thesis::query()
            ->with([
                'user:id,name,email',
                'chapters' => fn ($q) => $q->orderBy('position')->with('currentVersion'),
            ])
            ->withCount('chapters');

        if ($search) {
            $query->where(function ($q) use ($search): void {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search): void {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        $theses = $query->latest()->paginate(15);

        return response()->json($theses);
    }

    /**
     * Show single student thesis detail with all chapters and versions.
     */
    public function show(Thesis $thesis): JsonResponse
    {
        $thesis->load([
            'user:id,name,email',
            'chapters' => fn ($q) => $q->orderBy('position')->with(['currentVersion', 'references']),
        ]);

        return response()->json([
            'data' => $thesis,
        ]);
    }
}
