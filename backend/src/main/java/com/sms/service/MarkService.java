package com.sms.service;

import com.sms.dto.BulkMarkDTO;
import com.sms.dto.MarkDTO;
import com.sms.dto.MyMarksResponse;
import com.sms.dto.StudentMarkStatsDTO;
import com.sms.entity.Exam;
import com.sms.entity.Mark;
import com.sms.entity.Student;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.ExamRepository;
import com.sms.repository.MarkRepository;
import com.sms.repository.StudentRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarkService {

    private final MarkRepository markRepository;
    private final StudentRepository studentRepository;
    private final ExamRepository examRepository;

    @Transactional
    public List<MarkDTO> bulkSave(BulkMarkDTO dto) {
        Exam exam = examRepository.findById(dto.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + dto.getExamId()));

        List<MarkDTO> savedDtos = new ArrayList<>();
        for (BulkMarkDTO.Record record : dto.getRecords()) {
            Student student = studentRepository.findById(record.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + record.getStudentId()));

            Optional<Mark> existingOpt = markRepository.findByStudentIdAndExamId(record.getStudentId(), dto.getExamId());
            Mark mark;
            if (existingOpt.isPresent()) {
                mark = existingOpt.get();
                mark.setObtainedMarks(record.getObtainedMarks());
                mark.setRemarks(record.getRemarks());
            } else {
                mark = Mark.builder()
                        .student(student)
                        .exam(exam)
                        .obtainedMarks(record.getObtainedMarks())
                        .remarks(record.getRemarks())
                        .build();
            }
            Mark saved = markRepository.save(mark);
            savedDtos.add(toDto(saved));
        }
        return savedDtos;
    }

    @Transactional(readOnly = true)
    public List<MarkDTO> search(Long courseId, Long examId, Long studentId) {
        Specification<Mark> spec = (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (courseId != null) {
                predicates.add(cb.equal(root.get("student").get("course").get("id"), courseId));
            }
            if (examId != null) {
                predicates.add(cb.equal(root.get("exam").get("id"), examId));
            }
            if (studentId != null) {
                predicates.add(cb.equal(root.get("student").get("id"), studentId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return markRepository.findAll(spec).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudentMarkStatsDTO getStudentStats(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student not found with id: " + studentId);
        }
        List<Mark> marks = markRepository.findByStudentId(studentId);
        if (marks.isEmpty()) {
            return StudentMarkStatsDTO.builder()
                    .averagePercentage(0.0)
                    .gpa(0.0)
                    .examsCleared(0)
                    .totalExams(0)
                    .highestMark(0.0)
                    .build();
        }

        double totalPercentage = 0.0;
        int clearedCount = 0;
        double highestMark = 0.0;

        for (Mark mark : marks) {
            Exam exam = mark.getExam();
            double pct = (mark.getObtainedMarks() / exam.getMaxMarks()) * 100.0;
            totalPercentage += pct;
            if (mark.getObtainedMarks() >= exam.getPassingMarks()) {
                clearedCount++;
            }
            if (mark.getObtainedMarks() > highestMark) {
                highestMark = mark.getObtainedMarks();
            }
        }

        double averagePercentage = totalPercentage / marks.size();
        averagePercentage = Math.round(averagePercentage * 100.0) / 100.0;
        double gpa = averagePercentage / 25.0;
        gpa = Math.round(gpa * 100.0) / 100.0;

        return StudentMarkStatsDTO.builder()
                .averagePercentage(averagePercentage)
                .gpa(gpa)
                .examsCleared(clearedCount)
                .totalExams(marks.size())
                .highestMark(highestMark)
                .build();
    }

    @Transactional(readOnly = true)
    public MyMarksResponse getMyMarks(String email) {
        Student student = studentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user: " + email));

        StudentMarkStatsDTO stats = getStudentStats(student.getId());
        List<MarkDTO> history = markRepository.findByStudentId(student.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        return MyMarksResponse.builder()
                .stats(stats)
                .history(history)
                .build();
    }

    public MarkDTO toDto(Mark mark) {
        return MarkDTO.builder()
                .id(mark.getId())
                .studentId(mark.getStudent().getId())
                .studentRollNumber(mark.getStudent().getRollNumber())
                .studentFirstName(mark.getStudent().getFirstName())
                .studentLastName(mark.getStudent().getLastName())
                .examId(mark.getExam().getId())
                .examName(mark.getExam().getName())
                .examMaxMarks(mark.getExam().getMaxMarks())
                .examPassingMarks(mark.getExam().getPassingMarks())
                .examDate(mark.getExam().getDate())
                .obtainedMarks(mark.getObtainedMarks())
                .remarks(mark.getRemarks())
                .passed(mark.getObtainedMarks() >= mark.getExam().getPassingMarks())
                .build();
    }
}
