<?php

use App\Http\Controllers\Thesis\AcademicCheckerController;
use App\Http\Controllers\Thesis\ChapterAiWriterController;
use App\Http\Controllers\Thesis\ChapterAnnotationController;
use App\Http\Controllers\Thesis\ChapterController;
use App\Http\Controllers\Thesis\ChapterVersionController;
use App\Http\Controllers\Thesis\DefenseSimulatorController;
use App\Http\Controllers\Thesis\MilestoneController;
use App\Http\Controllers\Thesis\ParaphraseController;
use App\Http\Controllers\Thesis\ReferenceController;
use App\Http\Controllers\Thesis\SupervisionGuideController;
use App\Http\Controllers\Thesis\SupervisionNoteController;
use App\Http\Controllers\Thesis\TaskController;
use App\Http\Controllers\Thesis\TaskSuggestionController;
use App\Http\Controllers\Thesis\ThesisController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Thesis Routes
|--------------------------------------------------------------------------
|
| Student-scoped thesis, chapter, and version routes. Loaded via the `then`
| callback in bootstrap/app.php — wrapped in `web` middleware + `api/` prefix.
| Auth + ownership enforced by `auth` middleware and per-model policies/scopes.
| Subscription permissions enforced by `subscription.permission:*` middleware.
|
*/

Route::middleware(['web', 'auth'])->prefix('api')->group(function (): void {
    // Core Thesis Access (Requires 'access thesis' permission - Starter+)
    Route::middleware('subscription.permission:access thesis')->group(function (): void {
        Route::get('thesis', [ThesisController::class, 'index']);
        Route::post('thesis', [ThesisController::class, 'store']);
        Route::get('thesis/{thesis}', [ThesisController::class, 'show']);
        Route::patch('thesis/{thesis}', [ThesisController::class, 'update']);
        Route::delete('thesis/{thesis}', [ThesisController::class, 'destroy']);
        Route::get('thesis/{thesis}/export/docx', [ThesisController::class, 'exportDocx']);
        Route::get('thesis/{thesis}/export/pdf', [ThesisController::class, 'exportPdf']);

        Route::get('thesis/{thesis}/chapters', [ChapterController::class, 'index']);
        Route::post('thesis/{thesis}/chapters', [ChapterController::class, 'store']);
        Route::get('thesis/{thesis}/chapters/{chapter}', [ChapterController::class, 'show']);
        Route::patch('thesis/{thesis}/chapters/{chapter}', [ChapterController::class, 'update']);
        Route::put('thesis/{thesis}/chapters/{chapter}/content', [ChapterController::class, 'saveContent']);
        Route::delete('thesis/{thesis}/chapters/{chapter}', [ChapterController::class, 'destroy']);

        Route::post('thesis/{thesis}/chapters/{chapter}/versions', [ChapterVersionController::class, 'store']);
        Route::get('thesis/{thesis}/chapters/{chapter}/versions', [ChapterVersionController::class, 'index']);
        Route::get('thesis/{thesis}/chapters/{chapter}/versions/{version}', [ChapterVersionController::class, 'show']);
        Route::get('thesis/{thesis}/chapters/{chapter}/versions/{version}/download', [ChapterVersionController::class, 'download']);
        Route::post('thesis/{thesis}/chapters/{chapter}/versions/{version}/revert', [ChapterVersionController::class, 'revert']);

        Route::get('thesis/{thesis}/chapters/{chapter}/references', [ReferenceController::class, 'index']);
        Route::post('thesis/{thesis}/chapters/{chapter}/references', [ReferenceController::class, 'store']);
        Route::patch('thesis/{thesis}/chapters/{chapter}/references/{reference}', [ReferenceController::class, 'update']);
        Route::delete('thesis/{thesis}/chapters/{chapter}/references/{reference}', [ReferenceController::class, 'destroy']);
        Route::get('thesis/{thesis}/chapters/{chapter}/references/{reference}/download', [ReferenceController::class, 'download']);

        Route::get('thesis/{thesis}/chapters/{chapter}/notulen', [SupervisionNoteController::class, 'show']);
        Route::put('thesis/{thesis}/chapters/{chapter}/notulen', [SupervisionNoteController::class, 'upsert']);
        Route::delete('thesis/{thesis}/chapters/{chapter}/notulen', [SupervisionNoteController::class, 'destroy']);

        Route::get('thesis/{thesis}/chapters/{chapter}/annotations', [ChapterAnnotationController::class, 'index']);
        Route::post('thesis/{thesis}/chapters/{chapter}/annotations', [ChapterAnnotationController::class, 'store']);
        Route::patch('thesis/{thesis}/chapters/{chapter}/annotations/{annotation}', [ChapterAnnotationController::class, 'update']);
        Route::delete('thesis/{thesis}/chapters/{chapter}/annotations/{annotation}', [ChapterAnnotationController::class, 'destroy']);
    });

    // Supervision Module (Requires 'access supervision' permission - Pro+)
    Route::middleware('subscription.permission:access supervision')->group(function (): void {
        Route::get('thesis/{thesis}/supervision-guides/current', [SupervisionGuideController::class, 'current']);
        Route::post('thesis/{thesis}/supervision-guides', [SupervisionGuideController::class, 'store']);
        Route::get('thesis/{thesis}/supervision-guides', [SupervisionGuideController::class, 'index']);
        Route::get('thesis/{thesis}/supervision-guides/{guide}', [SupervisionGuideController::class, 'show']);
        Route::post('thesis/{thesis}/supervision-guides/{guide}/points', [SupervisionGuideController::class, 'storePoint']);
        Route::patch('thesis/{thesis}/supervision-guides/{guide}/points/{point}', [SupervisionGuideController::class, 'updatePoint']);
        Route::delete('thesis/{thesis}/supervision-guides/{guide}/points/{point}', [SupervisionGuideController::class, 'destroyPoint']);
    });

    // Kanban & Progress Module (Requires 'access kanban' permission - Pro+)
    Route::middleware('subscription.permission:access kanban')->group(function (): void {
        Route::get('thesis/{thesis}/tasks', [TaskController::class, 'index']);
        Route::post('thesis/{thesis}/tasks', [TaskController::class, 'store']);
        Route::patch('thesis/{thesis}/tasks/{task}', [TaskController::class, 'update']);
        Route::patch('thesis/{thesis}/tasks/{task}/move', [TaskController::class, 'move']);
        Route::delete('thesis/{thesis}/tasks/{task}', [TaskController::class, 'destroy']);

        Route::get('thesis/{thesis}/milestones', [MilestoneController::class, 'index']);
        Route::post('thesis/{thesis}/milestones', [MilestoneController::class, 'store']);
        Route::patch('thesis/{thesis}/milestones/{milestone}', [MilestoneController::class, 'update']);
        Route::delete('thesis/{thesis}/milestones/{milestone}', [MilestoneController::class, 'destroy']);

        Route::post('thesis/{thesis}/task-suggestions', [TaskSuggestionController::class, 'generate']);
        Route::get('thesis/{thesis}/task-suggestions', [TaskSuggestionController::class, 'index']);
        Route::post('thesis/{thesis}/task-suggestions/{suggestion}/accept', [TaskSuggestionController::class, 'accept']);
        Route::post('thesis/{thesis}/task-suggestions/{suggestion}/reject', [TaskSuggestionController::class, 'reject']);
    });

    // Academic & AI Tools (Requires 'access academic tools' permission - Ultimate)
    Route::middleware('subscription.permission:access academic tools')->group(function (): void {
        Route::get('thesis/{thesis}/chapters/{chapter}/paraphrase', [ParaphraseController::class, 'index']);
        Route::post('thesis/{thesis}/chapters/{chapter}/paraphrase', [ParaphraseController::class, 'store']);
        Route::post('thesis/{thesis}/chapters/{chapter}/paraphrase/{paraphrase}/apply', [ParaphraseController::class, 'apply']);
        Route::post('thesis/{thesis}/chapters/{chapter}/grammar-check', [AcademicCheckerController::class, 'analyze']);
        Route::post('thesis/{thesis}/chapters/{chapter}/ai-write', [ChapterAiWriterController::class, 'generate']);
        Route::post('thesis/{thesis}/defense-simulator/questions', [DefenseSimulatorController::class, 'generateQuestions']);
        Route::post('thesis/{thesis}/defense-simulator/evaluate', [DefenseSimulatorController::class, 'evaluateAnswer']);
    });
});
