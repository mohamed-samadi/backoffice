<?php
namespace App\Http\Controllers;

use App\Models\TaskCategory;
use Illuminate\Http\Request;

class TaskCategoryController extends Controller
{
    // GET /api/task-categories
    public function index()
    {
        $categories = TaskCategory::orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
            'message' => 'Task categories retrieved successfully'
        ]);
    }

    // POST /api/task-categories
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:task_categories,name',
            'color' => 'nullable|string|max:20',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $category = TaskCategory::create($data);

        return response()->json([
            'success' => true,
            'data' => $category,
            'message' => 'Task category created successfully'
        ], 201);
    }

    // GET /api/task-categories/{id}
    public function show(TaskCategory $taskCategory)
    {
        return response()->json([
            'success' => true,
            'data' => $taskCategory
        ]);
    }

    // PUT /api/task-categories/{id}
    public function update(Request $request, TaskCategory $taskCategory)
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255|unique:task_categories,name,' . $taskCategory->id,
            'color' => 'nullable|string|max:20',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $taskCategory->update($data);

        return response()->json([
            'success' => true,
            'data' => $taskCategory,
            'message' => 'Task category updated successfully'
        ]);
    }

    // DELETE /api/task-categories/{id}
    public function destroy(TaskCategory $taskCategory)
    {
        // safety check
        if ($taskCategory->tasks()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category with tasks assigned'
            ], 409);
        }

        $taskCategory->delete();

        return response()->json([
            'success' => true,
            'message' => 'Task category deleted successfully'
        ]);
    }

    public function active()
    {
        $categories = TaskCategory::active()->get();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }
}