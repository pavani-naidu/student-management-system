package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.entity.Department;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.DepartmentRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
@Tag(name = "Departments", description = "Department CRUD")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Department>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Departments fetched", departmentRepository.findAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Department>> create(@Valid @RequestBody Department department) {
        return ResponseEntity.ok(ApiResponse.success("Department created", departmentRepository.save(department)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Department>> update(@PathVariable Long id, @Valid @RequestBody Department department) {
        Department existing = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        existing.setName(department.getName());
        existing.setCode(department.getCode());
        existing.setDescription(department.getDescription());
        return ResponseEntity.ok(ApiResponse.success("Department updated", departmentRepository.save(existing)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Department not found with id: " + id);
        }
        departmentRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Department deleted", null));
    }
}
