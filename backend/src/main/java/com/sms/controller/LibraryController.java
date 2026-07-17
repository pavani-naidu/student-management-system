package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.dto.BookDTO;
import com.sms.dto.BookIssueDTO;
import com.sms.service.LibraryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/library")
@RequiredArgsConstructor
@Tag(name = "Library", description = "Library book inventory and student loan management")
public class LibraryController {

    private final LibraryService libraryService;

    // --- Book endpoints ---

    @GetMapping("/books")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<BookDTO>>> getAllBooks() {
        return ResponseEntity.ok(ApiResponse.success("Books fetched successfully", libraryService.getAllBooks()));
    }

    @GetMapping("/books/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<ApiResponse<BookDTO>> getBookById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Book fetched successfully", libraryService.getBookById(id)));
    }

    @PostMapping("/books")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<BookDTO>> createBook(@Valid @RequestBody BookDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Book created successfully", libraryService.createBook(dto)));
    }

    @PutMapping("/books/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<BookDTO>> updateBook(@PathVariable Long id, @Valid @RequestBody BookDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Book updated successfully", libraryService.updateBook(id, dto)));
    }

    @DeleteMapping("/books/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteBook(@PathVariable Long id) {
        libraryService.deleteBook(id);
        return ResponseEntity.ok(ApiResponse.success("Book deleted successfully", null));
    }

    // --- Book Issue endpoints ---

    @GetMapping("/issues")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<BookIssueDTO>>> getAllIssues() {
        return ResponseEntity.ok(ApiResponse.success("Issue records fetched successfully", libraryService.getAllIssues()));
    }

    @PostMapping("/issues")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<BookIssueDTO>> issueBook(@Valid @RequestBody BookIssueDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Book issued successfully", libraryService.issueBook(dto)));
    }

    @PutMapping("/issues/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<BookIssueDTO>> updateIssue(@PathVariable Long id, @Valid @RequestBody BookIssueDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Issue record updated successfully", libraryService.updateIssue(id, dto)));
    }

    @DeleteMapping("/issues/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteIssue(@PathVariable Long id) {
        libraryService.deleteIssue(id);
        return ResponseEntity.ok(ApiResponse.success("Issue record deleted successfully", null));
    }

    @PostMapping("/issues/{id}/return")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<BookIssueDTO>> returnBook(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Book returned successfully", libraryService.returnBook(id)));
    }

    @GetMapping("/my-loans")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<BookIssueDTO>>> getMyLoans() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(ApiResponse.success("My loans fetched successfully", libraryService.getMyLoans(email)));
    }
}
