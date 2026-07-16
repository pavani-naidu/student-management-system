package com.sms.dto;

import com.sms.entity.Student;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class StudentDTO {

    private Long id;

    @NotBlank(message = "Roll number is required")
    private String rollNumber;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private Student.Gender gender;

    private LocalDate dateOfBirth;

    private String bloodGroup;

    @NotBlank(message = "Mobile number is required")
    private String mobileNumber;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    private String address;

    private String parentName;

    private String parentMobile;

    private Long departmentId;

    private String departmentName;

    private Long courseId;

    private String courseName;

    private Integer semester;

    private String section;

    private LocalDate admissionDate;

    private Student.StudentStatus status;

    private String profilePictureUrl;
}
