# Mitasu-DB

# API Documentation

This project provides an API for user management, Google login, and managing favorite anime (based on MyAnimeList IDs) using Jikan API, with an AI-powered recommendation feature using Gemini API.

## Base URL
https://mitasu-db-production.up.railway.app/

---

## 1. Public Endpoints (No authentication required)

### User Registration
*   **URL:** `/user/register`
*   **Method:** `POST`
*   **Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "yourpassword"
    }
    ```

### Login
*   **URL:** `/user/login`
*   **Method:** `POST`
*   **Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "yourpassword"
    }
    ```
*   **Response:** Returns an `access_token`.

### Google Login
*   **URL:** `/user/google-login`
*   **Method:** `POST`
*   **Headers:** `google-auth-token` (ID token obtained from Google)

---

## 2. Protected Endpoints (Authentication required)
※ Requires `Authorization: Bearer <access_token>` in the request header.

### Set Username
*   **URL:** `/user/addusername`
*   **Method:** `POST`
*   **Body:** `{ "username": "otaku_king" }`

### Get Bookmark List
*   **URL:** `/bookmark`
*   **Method:** `GET`
*   **Description:** Retrieves all bookmarks for the logged-in user.

### Add Bookmark
*   **URL:** `/bookmark`
*   **Method:** `POST`
*   **Body:**
    ```json
    {
      "mal_id": 5114,
      "title": "Fullmetal Alchemist: Brotherhood"
    }
    ```

### Delete Bookmark
*   **URL:** `/bookmark/:id`
*   **Method:** `DELETE`
*   **Params:** `id` (Database ID of the bookmark)

### AI Anime Recommendation
*   **URL:** `/ai/recommend`
*   **Method:** `GET`
*   **Description:** Uses Gemini AI to suggest anime based on the titles in your bookmarks.
*   **Response:** 
    ```json
    {
      "recommendations": ["Anime Title 1", "Anime Title 2", "Anime Title 3"],
      "reasoning": "Based on your interest in action and sci-fi..."
    }
    ```
