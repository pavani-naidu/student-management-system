package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.dto.TeacherDTO;
import com.sms.entity.Teacher;
import com.sms.service.TeacherService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teachers")
@RequiredArgsConstructor
@Tag(name = "Teachers", description = "Teacher management CRUD + search")
public class TeacherController {

    private final TeacherService teacherService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Page<TeacherDTO>>> search(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Teacher.TeacherStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<TeacherDTO> result = teacherService.search(query, departmentId, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Teachers fetched", result));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<TeacherDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Teacher fetched", teacherService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TeacherDTO>> create(@Valid @RequestBody TeacherDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Teacher created", teacherService.create(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TeacherDTO>> update(@PathVariable Long id, @Valid @RequestBody TeacherDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Teacher updated", teacherService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        teacherService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Teacher deleted", null));
    }
}
