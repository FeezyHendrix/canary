---
title: Emails
layout: default
parent: API Reference
nav_order: 1
---

# Emails API

Send emails and track their delivery status using the public API.

## Authentication

All email endpoints require API key authentication. Include your API key in the `X-API-Key` header:

```bash
curl -H "X-API-Key: cnry_your_api_key_here" ...
```

The API key must have the `send` scope to use these endpoints.

---

## Send Email

Send an email using a template.

```
POST /api/v1/send
```

### Headers

| Header         | Required | Description                    |
| -------------- | -------- | ------------------------------ |
| `X-API-Key`    | Yes      | Your API key with `send` scope |
| `Content-Type` | Yes      | Must be `application/json`     |

### Request Body

| Field            | Type               | Required | Description                            |
| ---------------- | ------------------ | -------- | -------------------------------------- |
| `templateId`     | string             | Yes      | Template ID or slug                    |
| `to`             | string or string[] | Yes      | Recipient email address(es)            |
| `variables`      | object             | No       | Template variables for personalization |
| `from`           | string             | No       | Override the sender address            |
| `subject`        | string             | No       | Override the email subject             |
| `replyTo`        | string             | No       | Reply-to email address                 |
| `attachments`    | array              | No       | File attachments (base64 encoded)      |
| `pdfAttachments` | array              | No       | PDF attachments to generate            |
| `tags`           | string[]           | No       | Tags for tracking and filtering        |
| `metadata`       | object             | No       | Custom key-value metadata              |

### Attachments

```json
{
  "attachments": [
    {
      "filename": "document.pdf",
      "content": "base64-encoded-content",
      "contentType": "application/pdf"
    }
  ]
}
```

### PDF Attachments

Generate PDFs from templates and attach them to the email:

```json
{
  "pdfAttachments": [
    {
      "templateId": "invoice-template",
      "filename": "invoice.pdf",
      "variables": {
        "invoiceNumber": "INV-001"
      }
    }
  ]
}
```

| Field        | Type   | Required | Description                                          |
| ------------ | ------ | -------- | ---------------------------------------------------- |
| `templateId` | string | Yes      | Template ID or slug for PDF generation               |
| `filename`   | string | Yes      | Output filename (e.g., `invoice.pdf`)                |
| `variables`  | object | No       | Variables for this PDF (defaults to email variables) |

### Example Request

```bash
curl -X POST https://your-domain.com/api/v1/send \
  -H "X-API-Key: cnry_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "welcome-email",
    "to": "user@example.com",
    "variables": {
      "name": "John Doe",
      "company": "Acme Inc"
    },
    "tags": ["onboarding", "welcome"],
    "metadata": {
      "userId": "usr_123",
      "campaign": "signup-flow"
    }
  }'
```

### Example with Multiple Recipients

```bash
curl -X POST https://your-domain.com/api/v1/send \
  -H "X-API-Key: cnry_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "newsletter",
    "to": ["user1@example.com", "user2@example.com"],
    "variables": {
      "month": "January"
    }
  }'
```

### Example with PDF Attachment

```bash
curl -X POST https://your-domain.com/api/v1/send \
  -H "X-API-Key: cnry_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "invoice-email",
    "to": "customer@example.com",
    "variables": {
      "customerName": "Jane Doe",
      "invoiceNumber": "INV-2024-001",
      "amount": "$150.00"
    },
    "pdfAttachments": [
      {
        "templateId": "invoice-pdf",
        "filename": "invoice-INV-2024-001.pdf",
        "variables": {
          "invoiceNumber": "INV-2024-001",
          "amount": "$150.00",
          "dueDate": "2024-02-15"
        }
      }
    ]
  }'
```

---

## Code Examples

Complete examples for sending emails using the Canary API in various programming languages.

### JavaScript (Node.js)

Using fetch (built-in from Node.js 18+):

```javascript
const API_URL = 'https://your-domain.com/api/v1/send';
const API_KEY = 'cnry_your_api_key';

async function sendEmail() {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateId: 'welcome-email',
        to: 'user@example.com',
        variables: {
          name: 'John',
          company: 'Acme Inc',
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API error: ${error.error?.message || response.statusText}`);
    }

    const result = await response.json();
    console.log('Email queued:', result.data.id);
    return result;
  } catch (error) {
    console.error('Failed to send email:', error.message);
    throw error;
  }
}

sendEmail();
```

Using axios:

```javascript
const axios = require('axios');

const API_URL = 'https://your-domain.com/api/v1/send';
const API_KEY = 'cnry_your_api_key';

async function sendEmail() {
  try {
    const response = await axios.post(
      API_URL,
      {
        templateId: 'welcome-email',
        to: 'user@example.com',
        variables: {
          name: 'John',
          company: 'Acme Inc',
        },
      },
      {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Email queued:', response.data.data.id);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('API error:', error.response.data.error?.message);
    } else {
      console.error('Request failed:', error.message);
    }
    throw error;
  }
}

sendEmail();
```

### Python

Using requests:

```python
import requests

API_URL = "https://your-domain.com/api/v1/send"
API_KEY = "cnry_your_api_key"


def send_email():
    headers = {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
    }

    payload = {
        "templateId": "welcome-email",
        "to": "user@example.com",
        "variables": {
            "name": "John",
            "company": "Acme Inc",
        },
    }

    try:
        response = requests.post(API_URL, json=payload, headers=headers)
        response.raise_for_status()

        result = response.json()
        print(f"Email queued: {result['data']['id']}")
        return result

    except requests.exceptions.HTTPError as e:
        error_data = e.response.json()
        print(f"API error: {error_data.get('error', {}).get('message', str(e))}")
        raise
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        raise


if __name__ == "__main__":
    send_email()
```

### PHP

Using cURL:

```php
<?php

$apiUrl = 'https://your-domain.com/api/v1/send';
$apiKey = 'cnry_your_api_key';

function sendEmail(): array {
    global $apiUrl, $apiKey;

    $payload = [
        'templateId' => 'welcome-email',
        'to' => 'user@example.com',
        'variables' => [
            'name' => 'John',
            'company' => 'Acme Inc',
        ],
    ];

    $ch = curl_init($apiUrl);

    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'X-API-Key: ' . $apiKey,
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode($payload),
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);

    curl_close($ch);

    if ($curlError) {
        throw new Exception("cURL error: $curlError");
    }

    $result = json_decode($response, true);

    if ($httpCode >= 400) {
        $errorMessage = $result['error']['message'] ?? 'Unknown error';
        throw new Exception("API error ($httpCode): $errorMessage");
    }

    echo "Email queued: " . $result['data']['id'] . "\n";
    return $result;
}

try {
    sendEmail();
} catch (Exception $e) {
    echo "Failed to send email: " . $e->getMessage() . "\n";
}
```

### Ruby

Using Net::HTTP:

```ruby
require 'net/http'
require 'uri'
require 'json'

API_URL = 'https://your-domain.com/api/v1/send'
API_KEY = 'cnry_your_api_key'

def send_email
  uri = URI.parse(API_URL)

  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = uri.scheme == 'https'

  request = Net::HTTP::Post.new(uri.request_uri)
  request['X-API-Key'] = API_KEY
  request['Content-Type'] = 'application/json'

  request.body = {
    templateId: 'welcome-email',
    to: 'user@example.com',
    variables: {
      name: 'John',
      company: 'Acme Inc'
    }
  }.to_json

  response = http.request(request)
  result = JSON.parse(response.body)

  unless response.is_a?(Net::HTTPSuccess)
    error_message = result.dig('error', 'message') || 'Unknown error'
    raise "API error (#{response.code}): #{error_message}"
  end

  puts "Email queued: #{result['data']['id']}"
  result
rescue StandardError => e
  puts "Failed to send email: #{e.message}"
  raise
end

send_email
```

### Go

Using net/http:

```go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

const (
	apiURL = "https://your-domain.com/api/v1/send"
	apiKey = "cnry_your_api_key"
)

type SendEmailRequest struct {
	TemplateID string            `json:"templateId"`
	To         string            `json:"to"`
	Variables  map[string]string `json:"variables"`
}

type SendEmailResponse struct {
	Success bool `json:"success"`
	Data    struct {
		ID     string `json:"id"`
		JobID  string `json:"jobId"`
		Status string `json:"status"`
	} `json:"data"`
	Error *struct {
		Code    string `json:"code"`
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

func sendEmail() (*SendEmailResponse, error) {
	payload := SendEmailRequest{
		TemplateID: "welcome-email",
		To:         "user@example.com",
		Variables: map[string]string{
			"name":    "John",
			"company": "Acme Inc",
		},
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("X-API-Key", apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var result SendEmailResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	if resp.StatusCode >= 400 {
		errMsg := "unknown error"
		if result.Error != nil {
			errMsg = result.Error.Message
		}
		return nil, fmt.Errorf("API error (%d): %s", resp.StatusCode, errMsg)
	}

	fmt.Printf("Email queued: %s\n", result.Data.ID)
	return &result, nil
}

func main() {
	if _, err := sendEmail(); err != nil {
		fmt.Printf("Failed to send email: %v\n", err)
	}
}
```

### Java

Using HttpClient (Java 11+):

```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class CanaryEmailClient {
    private static final String API_URL = "https://your-domain.com/api/v1/send";
    private static final String API_KEY = "cnry_your_api_key";

    public static void main(String[] args) {
        try {
            sendEmail();
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    public static String sendEmail() throws Exception {
        String jsonPayload = """
            {
                "templateId": "welcome-email",
                "to": "user@example.com",
                "variables": {
                    "name": "John",
                    "company": "Acme Inc"
                }
            }
            """;

        HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(API_URL))
            .header("X-API-Key", API_KEY)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
            .build();

        HttpResponse<String> response = client.send(
            request,
            HttpResponse.BodyHandlers.ofString()
        );

        if (response.statusCode() >= 400) {
            throw new RuntimeException(
                "API error (" + response.statusCode() + "): " + response.body()
            );
        }

        System.out.println("Email sent successfully: " + response.body());
        return response.body();
    }
}
```

### C#

Using HttpClient (.NET):

```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

class CanaryEmailClient
{
    private const string ApiUrl = "https://your-domain.com/api/v1/send";
    private const string ApiKey = "cnry_your_api_key";

    static async Task Main(string[] args)
    {
        try
        {
            var result = await SendEmailAsync();
            Console.WriteLine($"Email queued: {result}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send email: {ex.Message}");
        }
    }

    static async Task<string> SendEmailAsync()
    {
        using var client = new HttpClient();

        client.DefaultRequestHeaders.Add("X-API-Key", ApiKey);

        var payload = new
        {
            templateId = "welcome-email",
            to = "user@example.com",
            variables = new
            {
                name = "John",
                company = "Acme Inc"
            }
        };

        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await client.PostAsync(ApiUrl, content);
        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException(
                $"API error ({(int)response.StatusCode}): {responseBody}"
            );
        }

        using var doc = JsonDocument.Parse(responseBody);
        var emailId = doc.RootElement
            .GetProperty("data")
            .GetProperty("id")
            .GetString();

        Console.WriteLine($"Email queued: {emailId}");
        return responseBody;
    }
}
```

### Kotlin

Using OkHttp:

```kotlin
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

const val API_URL = "https://your-domain.com/api/v1/send"
const val API_KEY = "cnry_your_api_key"

fun sendEmail(): JSONObject {
    val client = OkHttpClient()

    val payload = JSONObject().apply {
        put("templateId", "welcome-email")
        put("to", "user@example.com")
        put("variables", JSONObject().apply {
            put("name", "John")
            put("company", "Acme Inc")
        })
    }

    val mediaType = "application/json; charset=utf-8".toMediaType()
    val requestBody = payload.toString().toRequestBody(mediaType)

    val request = Request.Builder()
        .url(API_URL)
        .addHeader("X-API-Key", API_KEY)
        .addHeader("Content-Type", "application/json")
        .post(requestBody)
        .build()

    client.newCall(request).execute().use { response ->
        val responseBody = response.body?.string()
            ?: throw IOException("Empty response body")

        if (!response.isSuccessful) {
            val error = JSONObject(responseBody)
                .optJSONObject("error")
                ?.optString("message") ?: "Unknown error"
            throw IOException("API error (${response.code}): $error")
        }

        val result = JSONObject(responseBody)
        val emailId = result.getJSONObject("data").getString("id")
        println("Email queued: $emailId")

        return result
    }
}

fun main() {
    try {
        sendEmail()
    } catch (e: Exception) {
        println("Failed to send email: ${e.message}")
    }
}
```

### Swift

Using URLSession:

```swift
import Foundation

let apiUrl = "https://your-domain.com/api/v1/send"
let apiKey = "cnry_your_api_key"

struct SendEmailRequest: Codable {
    let templateId: String
    let to: String
    let variables: [String: String]
}

struct SendEmailResponse: Codable {
    let success: Bool
    let data: EmailData?
    let error: APIError?

    struct EmailData: Codable {
        let id: String
        let jobId: String
        let status: String
    }

    struct APIError: Codable {
        let code: String
        let message: String
    }
}

func sendEmail() async throws -> SendEmailResponse {
    guard let url = URL(string: apiUrl) else {
        throw URLError(.badURL)
    }

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue(apiKey, forHTTPHeaderField: "X-API-Key")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    let payload = SendEmailRequest(
        templateId: "welcome-email",
        to: "user@example.com",
        variables: [
            "name": "John",
            "company": "Acme Inc"
        ]
    )

    request.httpBody = try JSONEncoder().encode(payload)

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let httpResponse = response as? HTTPURLResponse else {
        throw URLError(.badServerResponse)
    }

    let result = try JSONDecoder().decode(SendEmailResponse.self, from: data)

    if httpResponse.statusCode >= 400 {
        let errorMessage = result.error?.message ?? "Unknown error"
        throw NSError(
            domain: "CanaryAPI",
            code: httpResponse.statusCode,
            userInfo: [NSLocalizedDescriptionKey: "API error: \(errorMessage)"]
        )
    }

    if let emailId = result.data?.id {
        print("Email queued: \(emailId)")
    }

    return result
}

// Usage
Task {
    do {
        let result = try await sendEmail()
        print("Success: \(result.success)")
    } catch {
        print("Failed to send email: \(error.localizedDescription)")
    }
}
```

---

### Response

```json
{
  "success": true,
  "data": {
    "id": "eml_abc123def456",
    "jobId": "job_xyz789",
    "status": "queued"
  }
}
```

| Field    | Type   | Description                      |
| -------- | ------ | -------------------------------- |
| `id`     | string | Unique email log ID              |
| `jobId`  | string | Background job ID                |
| `status` | string | Initial status (always `queued`) |

### Error Responses

**Invalid Template (400)**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_TEMPLATE",
    "message": "Template not found: welcome-email"
  }
}
```

**No Adapter Configured (400)**

```json
{
  "success": false,
  "error": {
    "code": "ADAPTER_ERROR",
    "message": "No active email adapter configured"
  }
}
```

**Invalid API Key (401)**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or missing API key"
  }
}
```

---

## Get Email Status

Check the delivery status of a sent email.

```
GET /api/v1/:id/status
```

### Headers

| Header      | Required | Description                    |
| ----------- | -------- | ------------------------------ |
| `X-API-Key` | Yes      | Your API key with `send` scope |

### Path Parameters

| Parameter | Type   | Description                         |
| --------- | ------ | ----------------------------------- |
| `id`      | string | Email log ID from the send response |

### Example Request

```bash
curl https://your-domain.com/api/v1/eml_abc123def456/status \
  -H "X-API-Key: cnry_your_api_key"
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "eml_abc123def456",
    "status": "delivered",
    "sentAt": "2024-01-15T10:30:00.000Z",
    "providerMessageId": "msg_provider_123",
    "hasPdfAttachment": true
  }
}
```

| Field               | Type    | Description                       |
| ------------------- | ------- | --------------------------------- |
| `id`                | string  | Email log ID                      |
| `status`            | string  | Current delivery status           |
| `sentAt`            | string  | ISO timestamp when sent (if sent) |
| `providerMessageId` | string  | Message ID from email provider    |
| `errorMessage`      | string  | Error message (if failed)         |
| `hasPdfAttachment`  | boolean | Whether email has PDF attachment  |

### Email Statuses

| Status      | Description                      |
| ----------- | -------------------------------- |
| `queued`    | Email is queued for sending      |
| `sent`      | Email was sent to the provider   |
| `delivered` | Email was delivered to recipient |
| `opened`    | Recipient opened the email       |
| `clicked`   | Recipient clicked a link         |
| `bounced`   | Email bounced (invalid address)  |
| `failed`    | Sending failed                   |
| `spam`      | Email was marked as spam         |

### Error Responses

**Not Found (404)**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Email not found"
  }
}
```

---

## Template Variables

Templates support Handlebars-style variables using double curly braces:

```html
<p>Hello {{name}},</p>
<p>Welcome to {{company}}!</p>
```

Pass variables in the `variables` field when sending:

```json
{
  "templateId": "welcome",
  "to": "user@example.com",
  "variables": {
    "name": "John",
    "company": "Acme Inc"
  }
}
```

### Nested Variables

Access nested objects using dot notation:

```html
<p>Order #{{order.id}}</p>
<p>Total: {{order.total}}</p>
```

```json
{
  "variables": {
    "order": {
      "id": "ORD-123",
      "total": "$99.00"
    }
  }
}
```

### Conditional Content

Use Handlebars conditionals:

```html
{{#if premium}}
<p>Thank you for being a premium member!</p>
{{/if}}
```

### Loops

Iterate over arrays:

```html
{{#each items}}
<li>{{this.name}} - {{this.price}}</li>
{{/each}}
```

```json
{
  "variables": {
    "items": [
      { "name": "Widget", "price": "$10" },
      { "name": "Gadget", "price": "$20" }
    ]
  }
}
```
