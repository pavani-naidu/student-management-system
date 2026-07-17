package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.dto.ExamDTO;
import com.sms.service.ExamService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
@Tag(name = "Exams", description = "Examination Management endpoints")
public class ExamController {

    private final ExamService examService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<ExamDTO>>> getAll(@RequestParam(required = false) Long courseId) {
        List<ExamDTO> exams;
        if (courseId != null) {
            exams = examService.getByCourseId(courseId);
        } else {
            exams = examService.getAll();
        }
        return ResponseEntity.ok(ApiResponse.success("Exams fetched successfully", exams));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<ExamDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Exam fetched successfully", examService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ExamDTO>> create(@RequestBody ExamDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Exam created successfully", examService.create(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ExamDTO>> update(@PathVariable Long id, @RequestBody ExamDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Exam updated successfully", examService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        examService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Exam deleted successfully", null));
    }
}
