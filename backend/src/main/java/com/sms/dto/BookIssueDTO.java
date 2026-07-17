package com.sms.dto;

import com.sms.entity.BookIssueStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class BookIssueDTO {
    private Long id;

    @NotNull(message = "Book ID is required")
    private Long bookId;

    private String bookTitle;
    private String bookAuthor;
    private String bookIsbn;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    private String studentRoll;
    private String studentName;

    @NotNull(message = "Issue date is required")
    private LocalDate issueDate;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    private LocalDate returnDate;
    private BookIssueStatus status;
    private Double fine;
}
