package com.smarthire.dto;

import com.smarthire.model.Role;
import lombok.Data;

public class AuthDTO {

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    public static class RegisterRequest {
        private String username;
        private String password;
        private String email;
        private Role role;

        // Optional profile fields
        private String profileSummary;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String type = "Bearer";
        private String username;
        private String role;
        private Long id;

        public AuthResponse(String token, String username, String role, Long id) {
            this.token = token;
            this.username = username;
            this.role = role;
            this.id = id;
        }
    }
}
