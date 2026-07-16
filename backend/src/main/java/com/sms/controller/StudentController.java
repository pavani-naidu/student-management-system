package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.dto.StudentDTO;
import com.sms.entity.Student;
import com.sms.service.StudentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@Tag(name = "Students", description = "Student management CRUD + search")
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<StudentDTO>>> search(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Student.StudentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<StudentDTO> result = studentService.search(query, departmentId, courseId, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Students fetched", result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Student fetched", studentService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StudentDTO>> create(@Valid @RequestBody StudentDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Student created", studentService.create(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentDTO>> update(@PathVariable Long id, @Valid @RequestBody StudentDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Student updated", studentService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        studentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Student deleted", null));
    }
}
