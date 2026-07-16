package com.sms.service;

import com.sms.dto.StudentDTO;
import com.sms.entity.Course;
import com.sms.entity.Department;
import com.sms.entity.Student;
import com.sms.exception.DuplicateResourceException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.CourseRepository;
import com.sms.repository.DepartmentRepository;
import com.sms.repository.StudentRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;

    @Transactional
    public StudentDTO create(StudentDTO dto) {
        if (studentRepository.existsByRollNumber(dto.getRollNumber())) {
            throw new DuplicateResourceException("A student with roll number " + dto.getRollNumber() + " already exists");
        }
        if (studentRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("A student with email " + dto.getEmail() + " already exists");
        }

        Student student = new Student();
        applyDto(student, dto);
        Student saved = studentRepository.save(student);
        return toDto(saved);
    }

    @Transactional
    public StudentDTO update(Long id, StudentDTO dto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        if (!student.getRollNumber().equals(dto.getRollNumber()) && studentRepository.existsByRollNumber(dto.getRollNumber())) {
            throw new DuplicateResourceException("A student with roll number " + dto.getRollNumber() + " already exists");
        }
        if (!student.getEmail().equals(dto.getEmail()) && studentRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("A student with email " + dto.getEmail() + " already exists");
        }

        applyDto(student, dto);
        Student saved = studentRepository.save(student);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public StudentDTO getById(Long id) {
        return toDto(studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id)));
    }

    @Transactional
    public void delete(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Student not found with id: " + id);
        }
        studentRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Page<StudentDTO> search(String query, Long departmentId, Long courseId, Student.StudentStatus status, Pageable pageable) {
        Specification<Student> spec = (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (query != null && !query.isBlank()) {
                String like = "%" + query.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("firstName")), like),
                        cb.like(cb.lower(root.get("lastName")), like),
                        cb.like(cb.lower(root.get("rollNumber")), like),
                        cb.like(cb.lower(root.get("email")), like)
                ));
            }
            if (departmentId != null) {
                predicates.add(cb.equal(root.get("department").get("id"), departmentId));
            }
            if (courseId != null) {
                predicates.add(cb.equal(root.get("course").get("id"), courseId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return studentRepository.findAll(spec, pageable).map(this::toDto);
    }

    private void applyDto(Student student, StudentDTO dto) {
        student.setRollNumber(dto.getRollNumber());
        student.setFirstName(dto.getFirstName());
        student.setLastName(dto.getLastName());
        student.setGender(dto.getGender());
        student.setDateOfBirth(dto.getDateOfBirth());
        student.setBloodGroup(dto.getBloodGroup());
        student.setMobileNumber(dto.getMobileNumber());
        student.setEmail(dto.getEmail());
        student.setAddress(dto.getAddress());
        student.setParentName(dto.getParentName());
        student.setParentMobile(dto.getParentMobile());
        student.setSemester(dto.getSemester());
        student.setSection(dto.getSection());
        student.setAdmissionDate(dto.getAdmissionDate());
        student.setProfilePictureUrl(dto.getProfilePictureUrl());
        if (dto.getStatus() != null) {
            student.setStatus(dto.getStatus());
        }

        if (dto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + dto.getDepartmentId()));
            student.setDepartment(department);
        } else {
            student.setDepartment(null);
        }

        if (dto.getCourseId() != null) {
            Course course = courseRepository.findById(dto.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + dto.getCourseId()));
            student.setCourse(course);
        } else {
            student.setCourse(null);
        }
    }

    private StudentDTO toDto(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setRollNumber(student.getRollNumber());
        dto.setFirstName(student.getFirstName());
        dto.setLastName(student.getLastName());
        dto.setGender(student.getGender());
        dto.setDateOfBirth(student.getDateOfBirth());
        dto.setBloodGroup(student.getBloodGroup());
        dto.setMobileNumber(student.getMobileNumber());
        dto.setEmail(student.getEmail());
        dto.setAddress(student.getAddress());
        dto.setParentName(student.getParentName());
        dto.setParentMobile(student.getParentMobile());
        dto.setSemester(student.getSemester());
        dto.setSection(student.getSection());
        dto.setAdmissionDate(student.getAdmissionDate());
        dto.setStatus(student.getStatus());
        dto.setProfilePictureUrl(student.getProfilePictureUrl());

        if (student.getDepartment() != null) {
            dto.setDepartmentId(student.getDepartment().getId());
            dto.setDepartmentName(student.getDepartment().getName());
        }
        if (student.getCourse() != null) {
            dto.setCourseId(student.getCourse().getId());
            dto.setCourseName(student.getCourse().getName());
        }

        return dto;
    }
}
