<?php

namespace App\Services;

use App\Models\Teacher;
use App\Services\Content\ReordersRecords;
use App\Support\ImageUploader;
use Illuminate\Http\UploadedFile;

/**
 * Alta, edición y baja de maestros (con su foto).
 */
class TeacherService
{
    use ReordersRecords;

    private const FOLDER = 'teachers';

    private const MAX_WIDTH = 900;

    public function __construct(private ImageUploader $images) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, ?UploadedFile $photo = null): Teacher
    {
        return Teacher::create([
            ...$data,
            'photo_path' => $photo ? $this->images->store($photo, self::FOLDER, self::MAX_WIDTH) : null,
            'sort_order' => (int) Teacher::max('sort_order') + 1,
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Teacher $teacher, array $data, ?UploadedFile $photo = null, bool $removePhoto = false): Teacher
    {
        if ($photo) {
            $data['photo_path'] = $this->images->replace($teacher->photo_path, $photo, self::FOLDER, self::MAX_WIDTH);
        } elseif ($removePhoto) {
            $this->images->delete($teacher->photo_path);
            $data['photo_path'] = null;
        }

        $teacher->update($data);

        return $teacher;
    }

    /**
     * Las clases del maestro NO se borran: se quedan sin maestro asignado.
     */
    public function delete(Teacher $teacher): void
    {
        $this->images->delete($teacher->photo_path);
        $teacher->delete();
    }

    /**
     * @param  list<int>  $ids
     */
    public function reorder(array $ids): void
    {
        $this->applyOrder(Teacher::class, $ids);
    }
}
