package com.kilogram.backendcore.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.LocalDate;
import java.time.Period;

public class AdultValidator implements ConstraintValidator<Adult, LocalDate> {
    private int minAge;

    @Override
    public void initialize(Adult constraintAnnotation) {
        this.minAge = constraintAnnotation.minAge();
    }

    @Override
    public boolean isValid(LocalDate dob, ConstraintValidatorContext context) {
        if (dob == null) return false;
        // Calculate the time gap from dob to today
        return Period.between(dob, LocalDate.now()).getYears() >= minAge;
    }
}