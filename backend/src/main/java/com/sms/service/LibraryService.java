package com.sms.service;

import com.sms.dto.BookDTO;
import com.sms.dto.BookIssueDTO;
import com.sms.entity.Book;
import com.sms.entity.BookIssue;
import com.sms.entity.BookIssueStatus;
import com.sms.entity.Student;
import com.sms.exception.DuplicateResourceException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.BookIssueRepository;
import com.sms.repository.BookRepository;
import com.sms.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LibraryService {

    private final BookRepository bookRepository;
    private final BookIssueRepository bookIssueRepository;
    private final StudentRepository studentRepository;

    // --- Book CRUD ---

    @Transactional(readOnly = true)
    public List<BookDTO> getAllBooks() {
        return bookRepository.findAll().stream()
                .map(this::toBookDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookDTO getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        return toBookDto(book);
    }

    @Transactional
    public BookDTO createBook(BookDTO dto) {
        if (bookRepository.existsByIsbn(dto.getIsbn())) {
            throw new DuplicateResourceException("Book with ISBN " + dto.getIsbn() + " already exists");
        }
        Book book = Book.builder()
                .title(dto.getTitle())
                .author(dto.getAuthor())
                .isbn(dto.getIsbn())
                .copies(dto.getCopies())
                .availableCopies(dto.getCopies())
                .category(dto.getCategory())
                .build();
        return toBookDto(bookRepository.save(book));
    }

    @Transactional
    public BookDTO updateBook(Long id, BookDTO dto) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        if (!book.getIsbn().equals(dto.getIsbn()) && bookRepository.existsByIsbn(dto.getIsbn())) {
            throw new DuplicateResourceException("Book with ISBN " + dto.getIsbn() + " already exists");
        }

        int diff = dto.getCopies() - book.getCopies();
        int newAvailable = book.getAvailableCopies() + diff;
        if (newAvailable < 0) {
            throw new IllegalArgumentException("Cannot reduce copies below currently issued count");
        }

        book.setTitle(dto.getTitle());
        book.setAuthor(dto.getAuthor());
        book.setIsbn(dto.getIsbn());
        book.setCopies(dto.getCopies());
        book.setAvailableCopies(newAvailable);
        book.setCategory(dto.getCategory());

        return toBookDto(bookRepository.save(book));
    }

    @Transactional
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        List<BookIssue> activeIssues = bookIssueRepository.findByStatus(BookIssueStatus.ISSUED);
        boolean hasActiveLoans = activeIssues.stream().anyMatch(issue -> issue.getBook().getId().equals(id));
        if (hasActiveLoans) {
            throw new IllegalArgumentException("Cannot delete book with active loans");
        }
        bookRepository.delete(book);
    }

    // --- Book Issue CRUD ---

    @Transactional(readOnly = true)
    public List<BookIssueDTO> getAllIssues() {
        return bookIssueRepository.findAll().stream()
                .map(this::toIssueDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookIssueDTO issueBook(BookIssueDTO dto) {
        Book book = bookRepository.findById(dto.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + dto.getBookId()));
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + dto.getStudentId()));

        if (book.getAvailableCopies() <= 0) {
            throw new IllegalArgumentException("No copies available for issue");
        }

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        BookIssue issue = BookIssue.builder()
                .book(book)
                .student(student)
                .issueDate(dto.getIssueDate())
                .dueDate(dto.getDueDate())
                .status(BookIssueStatus.ISSUED)
                .fine(0.0)
                .build();

        return toIssueDto(bookIssueRepository.save(issue));
    }

    @Transactional
    public BookIssueDTO updateIssue(Long id, BookIssueDTO dto) {
        BookIssue issue = bookIssueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue record not found with id: " + id));

        if (dto.getStatus() == BookIssueStatus.RETURNED && issue.getStatus() != BookIssueStatus.RETURNED) {
            Book book = issue.getBook();
            book.setAvailableCopies(book.getAvailableCopies() + 1);
            bookRepository.save(book);
            issue.setReturnDate(dto.getReturnDate() != null ? dto.getReturnDate() : LocalDate.now());
            issue.setStatus(BookIssueStatus.RETURNED);
        } else if (dto.getStatus() == BookIssueStatus.ISSUED && issue.getStatus() == BookIssueStatus.RETURNED) {
            Book book = issue.getBook();
            if (book.getAvailableCopies() <= 0) {
                throw new IllegalArgumentException("Cannot revert return: no copies available");
            }
            book.setAvailableCopies(book.getAvailableCopies() - 1);
            bookRepository.save(book);
            issue.setReturnDate(null);
            issue.setStatus(BookIssueStatus.ISSUED);
        }

        issue.setDueDate(dto.getDueDate());
        issue.setFine(dto.getFine());
        return toIssueDto(bookIssueRepository.save(issue));
    }

    @Transactional
    public void deleteIssue(Long id) {
        BookIssue issue = bookIssueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue record not found with id: " + id));
        if (issue.getStatus() == BookIssueStatus.ISSUED || issue.getStatus() == BookIssueStatus.OVERDUE) {
            Book book = issue.getBook();
            book.setAvailableCopies(book.getAvailableCopies() + 1);
            bookRepository.save(book);
        }
        bookIssueRepository.delete(issue);
    }

    @Transactional
    public BookIssueDTO returnBook(Long id) {
        BookIssue issue = bookIssueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue record not found with id: " + id));

        if (issue.getStatus() == BookIssueStatus.RETURNED) {
            throw new IllegalArgumentException("Book is already returned");
        }

        LocalDate today = LocalDate.now();
        issue.setReturnDate(today);
        issue.setStatus(BookIssueStatus.RETURNED);

        if (today.isAfter(issue.getDueDate())) {
            long daysOverdue = ChronoUnit.DAYS.between(issue.getDueDate(), today);
            issue.setFine(daysOverdue * 5.0);
        } else {
            issue.setFine(0.0);
        }

        Book book = issue.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        return toIssueDto(bookIssueRepository.save(issue));
    }

    @Transactional(readOnly = true)
    public List<BookIssueDTO> getMyLoans(String email) {
        Student student = studentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for email: " + email));
        return bookIssueRepository.findByStudentId(student.getId()).stream()
                .map(this::toIssueDto)
                .collect(Collectors.toList());
    }

    private BookDTO toBookDto(Book book) {
        BookDTO dto = new BookDTO();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setIsbn(book.getIsbn());
        dto.setCopies(book.getCopies());
        dto.setAvailableCopies(book.getAvailableCopies());
        dto.setCategory(book.getCategory());
        return dto;
    }

    private BookIssueDTO toIssueDto(BookIssue issue) {
        BookIssueDTO dto = new BookIssueDTO();
        dto.setId(issue.getId());
        dto.setBookId(issue.getBook().getId());
        dto.setBookTitle(issue.getBook().getTitle());
        dto.setBookAuthor(issue.getBook().getAuthor());
        dto.setBookIsbn(issue.getBook().getIsbn());
        dto.setStudentId(issue.getStudent().getId());
        dto.setStudentRoll(issue.getStudent().getRollNumber());
        dto.setStudentName(issue.getStudent().getFirstName() + " " + issue.getStudent().getLastName());
        dto.setIssueDate(issue.getIssueDate());
        dto.setDueDate(issue.getDueDate());
        dto.setReturnDate(issue.getReturnDate());

        BookIssueStatus status = issue.getStatus();
        if (status == BookIssueStatus.ISSUED && LocalDate.now().isAfter(issue.getDueDate())) {
            status = BookIssueStatus.OVERDUE;
        }
        dto.setStatus(status);

        if (issue.getFine() != null) {
            dto.setFine(issue.getFine());
        } else {
            if (dto.getStatus() == BookIssueStatus.OVERDUE) {
                long daysOverdue = ChronoUnit.DAYS.between(issue.getDueDate(), LocalDate.now());
                dto.setFine(daysOverdue * 5.0);
            } else {
                dto.setFine(0.0);
            }
        }

        return dto;
    }
}
