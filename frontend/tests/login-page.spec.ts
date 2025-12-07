import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  // Run before each test to ensure a fresh page
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    // Verify page loaded correctly
    await expect(page).toHaveTitle('frontend');
    await expect(page.getByText('Welcome Back')).toBeVisible();
    await expect(page.getByText('Enter your credentials to access your account')).toBeVisible();
  });

  test('should display all login form elements', async ({ page }) => {
    // Verify all form elements are present
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Remember me' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
  });

  test('Scenario 1: User can sign in with correct credentials', async ({ page }) => {
    // Listen for console messages to verify login attempt
    let loginAttempted = false;
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('Login attempted with:')) {
        loginAttempted = true;
      }
    });

    // Step 1: Fill in email
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');

    // Step 2: Fill in password
    const passwordInput = page.getByRole('textbox', { name: 'Password' });
    await passwordInput.fill('password123');
    await expect(passwordInput).toHaveValue('password123');

    // Step 3: Click Sign In button
    const signInButton = page.getByRole('button', { name: 'Sign In' });
    await signInButton.click();

    // Step 4: Verify login attempt was made
    // Wait a moment for console log to appear
    await page.waitForTimeout(100);
    
    // Verify console log was triggered (cross-browser compatible)
    expect(loginAttempted).toBe(true);

    // Verify we're still on the same page (dummy login)
    expect(page.url()).toBe('http://localhost:5173/');
  });

  test('Scenario 2: User sign in with wrong credentials', async ({ page }) => {
    // Listen for console messages
    let loginAttempted = false;
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('Login attempted with:')) {
        loginAttempted = true;
      }
    });

    // Step 1: Fill in incorrect email
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    await emailInput.fill('wrong@example.com');
    await expect(emailInput).toHaveValue('wrong@example.com');

    // Step 2: Fill in incorrect password
    const passwordInput = page.getByRole('textbox', { name: 'Password' });
    await passwordInput.fill('wrongpassword');
    await expect(passwordInput).toHaveValue('wrongpassword');

    // Step 3: Click Sign In button
    const signInButton = page.getByRole('button', { name: 'Sign In' });
    await signInButton.click();

    // Step 4: Verify login attempt was made with wrong credentials
    await page.waitForTimeout(100);
    
    // Verify console log was triggered (cross-browser compatible)
    expect(loginAttempted).toBe(true);

    // Note: Since this is a dummy form, there's no error message displayed
    // In a real app, we would verify an error message appears
    expect(page.url()).toBe('http://localhost:5173/');
  });

  test('Scenario 3: User signup for a new account', async ({ page }) => {
    // Step 1: Verify Sign up link is visible
    const signUpLink = page.getByRole('link', { name: 'Sign up' });
    await expect(signUpLink).toBeVisible();
    await expect(signUpLink).toHaveText('Sign up');

    // Step 2: Click Sign up link
    await signUpLink.click();

    // Step 3: Verify link was clicked (though it doesn't navigate due to preventDefault)
    // In a real app, this would navigate to a signup page
    // For now, we verify the link is still on the same page
    expect(page.url()).toBe('http://localhost:5173/');
    
    // Verify the link is accessible and clickable
    await expect(signUpLink).toHaveAttribute('href', '#');
  });

  test('Scenario 4: User forgot password', async ({ page }) => {
    // Step 1: Verify Forgot password link is visible
    const forgotPasswordLink = page.getByRole('link', { name: 'Forgot password?' });
    await expect(forgotPasswordLink).toBeVisible();
    await expect(forgotPasswordLink).toHaveText('Forgot password?');

    // Step 2: Click Forgot password link
    await forgotPasswordLink.click();

    // Step 3: Verify link was clicked (though it doesn't navigate due to preventDefault)
    // In a real app, this would navigate to a password reset page
    expect(page.url()).toBe('http://localhost:5173/');
    
    // Verify the link is accessible and clickable
    await expect(forgotPasswordLink).toHaveAttribute('href', '#');
  });

  test('Scenario 5: User select remember me when login to keep session store', async ({ page }) => {
    // Listen for console messages
    let loginAttempted = false;
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('Login attempted with:')) {
        loginAttempted = true;
      }
    });

    // Step 1: Verify Remember me checkbox is not checked by default
    const rememberMeCheckbox = page.getByRole('checkbox', { name: 'Remember me' });
    await expect(rememberMeCheckbox).toBeVisible();
    await expect(rememberMeCheckbox).not.toBeChecked();

    // Step 2: Fill in credentials
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    await emailInput.fill('test@example.com');
    
    const passwordInput = page.getByRole('textbox', { name: 'Password' });
    await passwordInput.fill('password123');

    // Step 3: Check Remember me checkbox
    await rememberMeCheckbox.check();
    await expect(rememberMeCheckbox).toBeChecked();

    // Step 4: Submit the form
    const signInButton = page.getByRole('button', { name: 'Sign In' });
    await signInButton.click();

    // Step 5: Verify login attempt was made with remember me checked
    await page.waitForTimeout(100);
    
    // Verify console log was triggered (cross-browser compatible)
    expect(loginAttempted).toBe(true);

    // Verify checkbox remains checked after submission
    await expect(rememberMeCheckbox).toBeChecked();

    // Note: In a real app, we would verify that:
    // - Session/localStorage contains a remember token
    // - Cookie is set with appropriate expiration
    // - User remains logged in after page refresh
  });

  test('should uncheck Remember me checkbox when clicked twice', async ({ page }) => {
    const rememberMeCheckbox = page.getByRole('checkbox', { name: 'Remember me' });
    
    // Check the checkbox
    await rememberMeCheckbox.check();
    await expect(rememberMeCheckbox).toBeChecked();

    // Uncheck the checkbox
    await rememberMeCheckbox.uncheck();
    await expect(rememberMeCheckbox).not.toBeChecked();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    const signInButton = page.getByRole('button', { name: 'Sign In' });
    await signInButton.click();

    // HTML5 validation should prevent submission
    // Email field should be focused or show validation message
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    
    // Check if HTML5 validation is triggered
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });
});

