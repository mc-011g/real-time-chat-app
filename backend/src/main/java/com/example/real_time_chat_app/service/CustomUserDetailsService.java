package com.example.real_time_chat_app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.example.real_time_chat_app.model.User;
import com.example.real_time_chat_app.repository.UserRepository;

/** A custom implementation of UserDetailsService. */
@Service
public class CustomUserDetailsService
                implements UserDetailsService {

        @Autowired
        private UserRepository userRepository;

        /**
         * Retrieves the user from the database and returns a UserDetails object which
         * is used for authentication
         */
        @Override
        public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "User not found with email: " + email));

                return org.springframework.security.core.userdetails.User.builder()
                                .username(user.getEmail())
                                .password(user.getPassword())
                                .roles(user.getRole())
                                .build();
        }
}
