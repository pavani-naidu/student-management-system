package com.sms.dto;

import com.sms.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileDTO {
    private String fullName;
    private String email;
    private Role role;
    private String mobileNumber;
    private String address;
    private String currentPassword;
    private String newPassword;
}
