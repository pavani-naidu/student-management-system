package com.sms.service;

import com.sms.dto.TeacherDTO;
import com.sms.entity.Department;
import com.sms.entity.Teacher;
import com.sms.exception.DuplicateResourceException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.DepartmentRepository;
import com.sms.repository.TeacherRepository;
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
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional
    public TeacherDTO create(TeacherDTO dto) {
        if (teacherRepository.existsByEmployeeId(dto.getEmployeeId())) {
            throw new DuplicateResourceException("A teacher with employee ID " + dto.getEmployeeId() + " already exists");
        }
        if (teacherRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("A teacher with email " + dto.getEmail() + " already exists");
        }

        Teacher teacher = new Teacher();
        applyDto(teacher, dto);
        Teacher saved = teacherRepository.save(teacher);
        return toDto(saved);
    }

    @Transactional
    public TeacherDTO update(Long id, TeacherDTO dto) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + id));

        if (!teacher.getEmployeeId().equals(dto.getEmployeeId()) && teacherRepository.existsByEmployeeId(dto.getEmployeeId())) {
            throw new DuplicateResourceException("A teacher with employee ID " + dto.getEmployeeId() + " already exists");
        }
        if (!teacher.getEmail().equals(dto.getEmail()) && teacherRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("A teacher with email " + dto.getEmail() + " already exists");
        }

        applyDto(teacher, dto);
        Teacher saved = teacherRepository.save(teacher);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public TeacherDTO getById(Long id) {
        return toDto(teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + id)));
    }

    @Transactional
    public void delete(Long id) {
        if (!teacherRepository.existsById(id)) {
            throw new ResourceNotFoundException("Teacher not found with id: " + id);
        }
        teacherRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Page<TeacherDTO> search(String query, Long departmentId, Teacher.TeacherStatus status, Pageable pageable) {
        Specification<Teacher> spec = (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (query != null && !query.isBlank()) {
                String like = "%" + query.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("firstName")), like),
                        cb.like(cb.lower(root.get("lastName")), like),
                        cb.like(cb.lower(root.get("employeeId")), like),
                        cb.like(cb.lower(root.get("email")), like)
                ));
            }
            if (departmentId != null) {
                predicates.add(cb.equal(root.get("department").get("id"), departmentId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return teacherRepository.findAll(spec, pageable).map(this::toDto);
    }

    private void applyDto(Teacher teacher, TeacherDTO dto) {
        teacher.setEmployeeId(dto.getEmployeeId());
        teacher.setFirstName(dto.getFirstName());
        teacher.setLastName(dto.getLastName());
        teacher.setEmail(dto.getEmail());
        teacher.setMobileNumber(dto.getMobileNumber());
        teacher.setDesignation(dto.getDesignation());
        teacher.setJoiningDate(dto.getJoiningDate());
        if (dto.getStatus() != null) {
            teacher.setStatus(dto.getStatus());
        } else {
            teacher.setStatus(Teacher.TeacherStatus.ACTIVE);
        }

        if (dto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + dto.getDepartmentId()));
            teacher.setDepartment(department);
        } else {
            teacher.setDepartment(null);
        }
    }

    private TeacherDTO toDto(Teacher teacher) {
        TeacherDTO dto = new TeacherDTO();
        dto.setId(teacher.getId());
        dto.setEmployeeId(teacher.getEmployeeId());
        dto.setFirstName(teacher.getFirstName());
        dto.setLastName(teacher.getLastName());
        dto.setEmail(teacher.getEmail());
        dto.setMobileNumber(teacher.getMobileNumber());
        dto.setDesignation(teacher.getDesignation());
        dto.setJoiningDate(teacher.getJoiningDate());
        dto.setStatus(teacher.getStatus());

        if (teacher.getDepartment() != null) {
            dto.setDepartmentId(teacher.getDepartment().getId());
            dto.setDepartmentName(teacher.getDepartment().getName());
        }

        return dto;
    }
}
