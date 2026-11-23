package com.placement.system.dto;

public class LoginResponseDto {
    private String token;
    private String role;
    private String email;
    private String userId;

    public LoginResponseDto() {}

    public LoginResponseDto(String token, String role, String email, String userId) {
        this.token = token;
        this.role = role;
        this.email = email;
        this.userId = userId;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}
