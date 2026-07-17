package com.sms.service;

import com.sms.dto.ExamDTO;
import com.sms.entity.Course;
import com.sms.entity.Exam;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.CourseRepository;
import com.sms.repository.ExamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final CourseRepository courseRepository;

    @Transactional
    public ExamDTO create(ExamDTO dto) {
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + dto.getCourseId()));

        Exam exam = Exam.builder()
                .name(dto.getName())
                .date(dto.getDate())
                .course(course)
                .maxMarks(dto.getMaxMarks())
                .passingMarks(dto.getPassingMarks())
                .build();

        Exam saved = examRepository.save(exam);
        return toDto(saved);
    }

    @Transactional
    public ExamDTO update(Long id, ExamDTO dto) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));

        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + dto.getCourseId()));

        exam.setName(dto.getName());
        exam.setDate(dto.getDate());
        exam.setCourse(course);
        exam.setMaxMarks(dto.getMaxMarks());
        exam.setPassingMarks(dto.getPassingMarks());

        Exam saved = examRepository.save(exam);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public ExamDTO getById(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));
        return toDto(exam);
    }

    @Transactional(readOnly = true)
    public List<ExamDTO> getAll() {
        return examRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExamDTO> getByCourseId(Long courseId) {
        return examRepository.findByCourseId(courseId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void delete(Long id) {
        if (!examRepository.existsById(id)) {
            throw new ResourceNotFoundException("Exam not found with id: " + id);
        }
        examRepository.deleteById(id);
    }

    public ExamDTO toDto(Exam exam) {
        return ExamDTO.builder()
                .id(exam.getId())
                .name(exam.getName())
                .date(exam.getDate())
                .courseId(exam.getCourse().getId())
                .courseName(exam.getCourse().getName())
                .maxMarks(exam.getMaxMarks())
                .passingMarks(exam.getPassingMarks())
                .build();
    }
}
