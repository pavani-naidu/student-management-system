package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.entity.Course;
import com.sms.entity.Department;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.CourseRepository;
import com.sms.repository.DepartmentRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@Tag(name = "Courses", description = "Course CRUD")
public class CourseController {

    private final CourseRepository courseRepository;
    private final DepartmentRepository departmentRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Course>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Courses fetched", courseRepository.findAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Course>> create(@RequestBody CourseRequest request) {
        Department department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.departmentId()));

        Course course = Course.builder()
                .name(request.name())
                .code(request.code())
                .durationYears(request.durationYears())
                .department(department)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Course created", courseRepository.save(course)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        if (!courseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Course not found with id: " + id);
        }
        courseRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Course deleted", null));
    }

    public record CourseRequest(String name, String code, Long departmentId, Integer durationYears) {
    }
}
