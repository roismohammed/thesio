<?php

namespace App\Http\Controllers\Thesis;

use App\Http\Controllers\Controller;
use App\Http\Requests\Thesis\GenerateSupervisionGuideRequest;
use App\Http\Requests\Thesis\StoreGuidancePointRequest;
use App\Http\Requests\Thesis\UpdateGuidancePointRequest;
use App\Http\Resources\Thesis\GuidancePointResource;
use App\Http\Resources\Thesis\SupervisionGuideResource;
use App\Models\GuidancePoint;
use App\Models\SupervisionGuide;
use App\Models\Thesis;
use App\Services\Thesis\SupervisionGuideService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class SupervisionGuideController extends Controller
{
    public function __construct(
        private readonly SupervisionGuideService $supervisionGuideService,
    ) {}

    /**
     * The current guide. Marks viewed (clears the unread flag).
     */
    public function current(Thesis $thesis): JsonResponse
    {
        $this->authorize('view', $thesis);

        $guide = $this->supervisionGuideService->getCurrent($thesis);

        if ($guide === null) {
            return response()->json(['data' => null]);
        }

        $isUnread = $guide->generated_at
            && ($thesis->guidance_last_viewed_at === null || $guide->generated_at->gt($thesis->guidance_last_viewed_at));

        $this->supervisionGuideService->markViewed($thesis);

        return (new SupervisionGuideResource($guide->loadMissing('thesis')))
            ->additional(['is_unread' => $isUnread])
            ->response();
    }

    /**
     * On-demand generation for a thesis.
     */
    public function store(GenerateSupervisionGuideRequest $request, Thesis $thesis): JsonResponse
    {
        $this->authorize('view', $thesis);

        try {
            $guide = $this->supervisionGuideService->generateOnDemand($thesis);
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage() === SupervisionGuideService::NO_CHAPTERS_MESSAGE
                    ? SupervisionGuideService::NO_CHAPTERS_MESSAGE
                    : 'Gagal membuat agenda bimbingan. Silakan coba lagi.',
            ], 422);
        }

        return (new SupervisionGuideResource($guide->load(['points', 'thesis'])))
            ->additional(['is_unread' => true])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * History list (archived + current), newest first.
     */
    public function index(Thesis $thesis): JsonResponse
    {
        $this->authorize('view', $thesis);

        $guides = $thesis->supervisionGuides()
            ->withCount(['points'])
            ->get()
            ->map(function (SupervisionGuide $guide) {
                $preparedCount = $guide->points()
                    ->where('status', 'prepared')
                    ->count();

                return [
                    'id' => $guide->id,
                    'origin' => $guide->origin,
                    'status' => $guide->status,
                    'is_tailored' => $guide->is_tailored,
                    'generated_at' => $guide->generated_at?->toIso8601String(),
                    'points_count' => $guide->points_count,
                    'prepared_count' => $preparedCount,
                ];
            });

        return response()->json(['data' => $guides]);
    }

    /**
     * Show a past (or current) guide without clearing the unread flag.
     */
    public function show(Thesis $thesis, SupervisionGuide $guide): JsonResponse
    {
        $this->authorize('view', $thesis);

        $guide->load(['points', 'thesis']);

        return (new SupervisionGuideResource($guide))
            ->additional(['is_unread' => false])
            ->response();
    }

    /**
     * Add a custom (student) point to a guide.
     */
    public function storePoint(StoreGuidancePointRequest $request, Thesis $thesis, SupervisionGuide $guide): JsonResponse
    {
        $this->authorize('update', $thesis);

        $point = $this->supervisionGuideService->addPoint($guide, $request->validated());

        return (new GuidancePointResource($point))->response()->setStatusCode(201);
    }

    /**
     * Tailor a point (status, or title/description for student points).
     */
    public function updatePoint(UpdateGuidancePointRequest $request, Thesis $thesis, SupervisionGuide $guide, GuidancePoint $point): JsonResponse
    {
        $this->authorize('update', $thesis);

        $updated = $this->supervisionGuideService->updatePoint($guide, $point, $request->validated());

        return (new GuidancePointResource($updated))->response();
    }

    /**
     * Remove a point from a guide.
     */
    public function destroyPoint(Thesis $thesis, SupervisionGuide $guide, GuidancePoint $point): JsonResponse
    {
        $this->authorize('update', $thesis);

        $this->supervisionGuideService->deletePoint($guide, $point);

        return response()->json(null, 204);
    }
}
