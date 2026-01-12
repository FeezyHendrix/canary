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

---

## Code Examples

Select your programming language:

<div class="code-tabs">
<div class="code-tabs-nav">
<button class="active" data-lang="curl">cURL</button>
<button data-lang="javascript">JavaScript</button>
<button data-lang="python">Python</button>
<button data-lang="php">PHP</button>
<button data-lang="ruby">Ruby</button>
<button data-lang="go">Go</button>
<button data-lang="java">Java</button>
<button data-lang="csharp">C#</button>
<button data-lang="kotlin">Kotlin</button>
<button data-lang="swift">Swift</button>
</div>

<div class="code-tab-content active" data-lang="curl" markdown="1">

```bash
curl -X POST https://your-domain.com/api/v1/send \
  -H "X-API-Key: cnry_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "welcome-email",
    "to": "user@example.com",
    "variables": {
      "name": "John",
      "company": "Acme Inc"
    }
  }'
```

</div>

<div class="code-tab-content" data-lang="javascript" markdown="1">

**Using fetch (Node.js 18+):**

```javascript
const API_URL = 'https://your-domain.com/api/v1/send';
const API_KEY = 'cnry_your_api_key';

async function sendEmail() {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      templateId: 'welcome-email',
      to: 'user@example.com',
      variables: { name: 'John', company: 'Acme Inc' },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || response.statusText);
  }

  const result = await response.json();
  console.log('Email queued:', result.data.id);
  return result;
}
```

**Using axios:**

```javascript
const axios = require('axios');

async function sendEmail() {
  const response = await axios.post(
    'https://your-domain.com/api/v1/send',
    {
      templateId: 'welcome-email',
      to: 'user@example.com',
      variables: { name: 'John', company: 'Acme Inc' },
    },
    {
      headers: {
        'X-API-Key': 'cnry_your_api_key',
        'Content-Type': 'application/json',
      },
    }
  );
  console.log('Email queued:', response.data.data.id);
  return response.data;
}
```

</div>

<div class="code-tab-content" data-lang="python" markdown="1">

```python
import requests

API_URL = "https://your-domain.com/api/v1/send"
API_KEY = "cnry_your_api_key"

def send_email():
    response = requests.post(
        API_URL,
        json={
            "templateId": "welcome-email",
            "to": "user@example.com",
            "variables": {"name": "John", "company": "Acme Inc"},
        },
        headers={
            "X-API-Key": API_KEY,
            "Content-Type": "application/json",
        },
    )
    response.raise_for_status()
    result = response.json()
    print(f"Email queued: {result['data']['id']}")
    return result

if __name__ == "__main__":
    send_email()
```

</div>

<div class="code-tab-content" data-lang="php" markdown="1">

```php
<?php

$apiUrl = 'https://your-domain.com/api/v1/send';
$apiKey = 'cnry_your_api_key';

$payload = [
    'templateId' => 'welcome-email',
    'to' => 'user@example.com',
    'variables' => ['name' => 'John', 'company' => 'Acme Inc'],
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
curl_close($ch);

$result = json_decode($response, true);

if ($httpCode >= 400) {
    throw new Exception("API error: " . $result['error']['message']);
}

echo "Email queued: " . $result['data']['id'] . "\n";
```

</div>

<div class="code-tab-content" data-lang="ruby" markdown="1">

```ruby
require 'net/http'
require 'uri'
require 'json'

API_URL = 'https://your-domain.com/api/v1/send'
API_KEY = 'cnry_your_api_key'

uri = URI.parse(API_URL)
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Post.new(uri.request_uri)
request['X-API-Key'] = API_KEY
request['Content-Type'] = 'application/json'
request.body = {
  templateId: 'welcome-email',
  to: 'user@example.com',
  variables: { name: 'John', company: 'Acme Inc' }
}.to_json

response = http.request(request)
result = JSON.parse(response.body)

raise "API error: #{result['error']['message']}" unless response.is_a?(Net::HTTPSuccess)

puts "Email queued: #{result['data']['id']}"
```

</div>

<div class="code-tab-content" data-lang="go" markdown="1">

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
)

func sendEmail() error {
    payload := map[string]interface{}{
        "templateId": "welcome-email",
        "to":         "user@example.com",
        "variables":  map[string]string{"name": "John", "company": "Acme Inc"},
    }

    jsonData, _ := json.Marshal(payload)
    req, _ := http.NewRequest("POST", "https://your-domain.com/api/v1/send", bytes.NewBuffer(jsonData))
    req.Header.Set("X-API-Key", "cnry_your_api_key")
    req.Header.Set("Content-Type", "application/json")

    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()

    body, _ := io.ReadAll(resp.Body)
    var result map[string]interface{}
    json.Unmarshal(body, &result)

    if resp.StatusCode >= 400 {
        return fmt.Errorf("API error: %v", result["error"])
    }

    data := result["data"].(map[string]interface{})
    fmt.Printf("Email queued: %s\n", data["id"])
    return nil
}
```

</div>

<div class="code-tab-content" data-lang="java" markdown="1">

```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class CanaryClient {
    public static void main(String[] args) throws Exception {
        String json = """
            {
                "templateId": "welcome-email",
                "to": "user@example.com",
                "variables": {"name": "John", "company": "Acme Inc"}
            }
            """;

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://your-domain.com/api/v1/send"))
            .header("X-API-Key", "cnry_your_api_key")
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
            .send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 400) {
            throw new RuntimeException("API error: " + response.body());
        }

        System.out.println("Email sent: " + response.body());
    }
}
```

</div>

<div class="code-tab-content" data-lang="csharp" markdown="1">

```csharp
using System.Net.Http;
using System.Text;
using System.Text.Json;

var client = new HttpClient();
client.DefaultRequestHeaders.Add("X-API-Key", "cnry_your_api_key");

var payload = new {
    templateId = "welcome-email",
    to = "user@example.com",
    variables = new { name = "John", company = "Acme Inc" }
};

var content = new StringContent(
    JsonSerializer.Serialize(payload),
    Encoding.UTF8,
    "application/json"
);

var response = await client.PostAsync("https://your-domain.com/api/v1/send", content);
var body = await response.Content.ReadAsStringAsync();

if (!response.IsSuccessStatusCode) {
    throw new HttpRequestException($"API error: {body}");
}

using var doc = JsonDocument.Parse(body);
var emailId = doc.RootElement.GetProperty("data").GetProperty("id").GetString();
Console.WriteLine($"Email queued: {emailId}");
```

</div>

<div class="code-tab-content" data-lang="kotlin" markdown="1">

```kotlin
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

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

    val request = Request.Builder()
        .url("https://your-domain.com/api/v1/send")
        .addHeader("X-API-Key", "cnry_your_api_key")
        .post(payload.toString().toRequestBody("application/json".toMediaType()))
        .build()

    client.newCall(request).execute().use { response ->
        val result = JSONObject(response.body?.string() ?: "{}")
        if (!response.isSuccessful) throw Exception("API error: ${result.optJSONObject("error")}")
        println("Email queued: ${result.getJSONObject("data").getString("id")}")
        return result
    }
}
```

</div>

<div class="code-tab-content" data-lang="swift" markdown="1">

```swift
import Foundation

struct EmailRequest: Codable {
    let templateId: String
    let to: String
    let variables: [String: String]
}

func sendEmail() async throws {
    var request = URLRequest(url: URL(string: "https://your-domain.com/api/v1/send")!)
    request.httpMethod = "POST"
    request.setValue("cnry_your_api_key", forHTTPHeaderField: "X-API-Key")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try JSONEncoder().encode(EmailRequest(
        templateId: "welcome-email",
        to: "user@example.com",
        variables: ["name": "John", "company": "Acme Inc"]
    ))

    let (data, response) = try await URLSession.shared.data(for: request)
    let httpResponse = response as! HTTPURLResponse

    if httpResponse.statusCode >= 400 {
        throw URLError(.badServerResponse)
    }

    let json = try JSONSerialization.jsonObject(with: data) as! [String: Any]
    let emailData = json["data"] as! [String: Any]
    print("Email queued: \(emailData["id"]!)")
}
```

</div>
</div>

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

Canary uses [Handlebars](https://handlebarsjs.com/) for template rendering. Variables are enclosed in double curly braces and replaced with values when sending.

### Basic Usage

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
<p>Ship to: {{order.shipping.city}}, {{order.shipping.country}}</p>
```

```json
{
  "variables": {
    "order": {
      "id": "ORD-123",
      "total": "$99.00",
      "shipping": {
        "city": "New York",
        "country": "USA"
      }
    }
  }
}
```

---

### Conditionals

Use `{{#if}}` to conditionally render content:

```html
{{#if isPremium}}
  <p>Thank you for being a premium member!</p>
{{/if}}

{{#if hasDiscount}}
  <p>Your discount: {{discountAmount}}</p>
{{else}}
  <p>No discount applied</p>
{{/if}}
```

**Inverse conditionals** with `{{#unless}}`:

```html
{{#unless isVerified}}
  <p>Please verify your email address.</p>
{{/unless}}
```

---

### Loops

Iterate over arrays with `{{#each}}`:

```html
<h3>Your Order Items:</h3>
<ul>
{{#each items}}
  <li>{{this.name}} - {{this.price}}</li>
{{/each}}
</ul>
```

```json
{
  "variables": {
    "items": [
      { "name": "Widget", "price": "$10.00" },
      { "name": "Gadget", "price": "$25.00" }
    ]
  }
}
```

**Access index in loops** with `@index`:

```html
{{#each items}}
  <p>{{@index}}. {{this.name}}</p>
{{/each}}
```

---

### Comparison Helpers

Canary provides built-in comparison helpers:

| Helper | Description | Example |
|--------|-------------|---------|
| `eq` | Equal | `{{#if (eq status "active")}}` |
| `ne` | Not equal | `{{#if (ne status "cancelled")}}` |
| `gt` | Greater than | `{{#if (gt quantity 0)}}` |
| `gte` | Greater than or equal | `{{#if (gte total 100)}}` |
| `lt` | Less than | `{{#if (lt stock 10)}}` |
| `lte` | Less than or equal | `{{#if (lte days 30)}}` |
| `and` | Logical AND | `{{#if (and isActive isPremium)}}` |
| `or` | Logical OR | `{{#if (or hasEmail hasPhone)}}` |
| `not` | Logical NOT | `{{#if (not isExpired)}}` |

**Example:**

```html
{{#if (eq orderStatus "shipped")}}
  <p>Your order is on its way!</p>
{{/if}}

{{#if (and isPremium (gte orderTotal 50))}}
  <p>Free shipping applied!</p>
{{/if}}
```

---

### Formatting Helpers

Transform and format values:

| Helper | Description | Example |
|--------|-------------|---------|
| `formatDate` | Format dates | `{{formatDate createdAt "short"}}` |
| `formatCurrency` | Format as currency | `{{formatCurrency amount "USD"}}` |
| `uppercase` | Convert to uppercase | `{{uppercase name}}` |
| `lowercase` | Convert to lowercase | `{{lowercase email}}` |
| `capitalize` | Capitalize first letter | `{{capitalize status}}` |
| `truncate` | Truncate with ellipsis | `{{truncate description 100}}` |
| `default` | Default value if null | `{{default nickname "Friend"}}` |
| `json` | Output as JSON | `{{json orderData}}` |

#### formatDate

Format dates in different styles:

```html
<!-- ISO format (default) -->
<p>Created: {{formatDate createdAt}}</p>
<!-- Output: 2024-01-15T10:30:00.000Z -->

<!-- Short format -->
<p>Date: {{formatDate createdAt "short"}}</p>
<!-- Output: 1/15/2024 -->

<!-- Long format -->
<p>Date: {{formatDate createdAt "long"}}</p>
<!-- Output: Monday, January 15, 2024 -->
```

#### formatCurrency

Format numbers as currency:

```html
<p>Total: {{formatCurrency amount}}</p>
<!-- Output: $99.00 (default USD) -->

<p>Total: {{formatCurrency amount "EUR"}}</p>
<!-- Output: €99.00 -->

<p>Total: {{formatCurrency amount "GBP"}}</p>
<!-- Output: £99.00 -->
```

```json
{
  "variables": {
    "amount": 99
  }
}
```

#### truncate

Truncate long text:

```html
<p>{{truncate productDescription 50}}</p>
<!-- "This is a very long product description..." -->
```

#### default

Provide fallback values:

```html
<p>Hello {{default firstName "Valued Customer"}},</p>
<!-- If firstName is null/undefined, shows "Hello Valued Customer," -->
```

---

### Complete Example

Here's a full example combining multiple features:

**Template:**

```html
<h1>Order Confirmation</h1>

<p>Hello {{default name "Customer"}},</p>

<p>Thank you for your order on {{formatDate orderDate "long"}}!</p>

<h2>Order #{{order.id}}</h2>

<table>
  <tr>
    <th>Item</th>
    <th>Qty</th>
    <th>Price</th>
  </tr>
  {{#each order.items}}
  <tr>
    <td>{{this.name}}</td>
    <td>{{this.quantity}}</td>
    <td>{{formatCurrency this.price}}</td>
  </tr>
  {{/each}}
</table>

<p><strong>Total: {{formatCurrency order.total}}</strong></p>

{{#if (gte order.total 100)}}
  <p style="color: green;">✓ Free shipping included!</p>
{{/if}}

{{#if order.notes}}
  <p><em>Notes: {{truncate order.notes 200}}</em></p>
{{/if}}

<p>Questions? Reply to this email or contact support.</p>
```

**API Request:**

```json
{
  "templateId": "order-confirmation",
  "to": "customer@example.com",
  "variables": {
    "name": "John",
    "orderDate": "2024-01-15T10:30:00Z",
    "order": {
      "id": "ORD-12345",
      "items": [
        { "name": "Wireless Mouse", "quantity": 1, "price": 29.99 },
        { "name": "USB-C Cable", "quantity": 2, "price": 12.99 }
      ],
      "total": 55.97,
      "notes": "Please leave at the front door"
    }
  }
}
```

---

### Variable Extraction

When you create or update a template, Canary automatically extracts all variables used in the template. These are stored and displayed in the template editor to help you know what data to pass when sending.

Variables are extracted from:
- Template subject line
- Template body content (HTML)
- All block content in the visual editor

---

### Tips

1. **Missing variables** render as empty strings - always provide all required variables
2. **Use `default` helper** for optional variables to show fallback content
3. **Test with sample data** in the template editor before sending
4. **Nested paths** like `{{user.address.city}}` fail silently if any part is undefined
