package com.sms.dto;

import com.sms.entity.Teacher;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TeacherDTO {

    private Long id;

    @NotBlank(message = "Employee ID is required")
    private String employeeId;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    private String mobileNumber;

    private Long departmentId;

    private String departmentName;

    private String designation;

    private LocalDate joiningDate;

    private Teacher.TeacherStatus status;
}
