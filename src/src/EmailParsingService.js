/**
 * Email Parsing Service
 * This service is responsible for parsing .eml files and extracting features
 * according to the methodology defined in the referenced research paper.
 */

export default class EmailParsingService {
    /**
     * Parse an .eml file content and extract all necessary features
     * @param {string} emlContent - Raw content of the .eml file
     * @returns {Object} Extracted features object
     */
    static parseEmail(emlContent) {
        const headerFeatures = this.extractHeaderFeatures(emlContent);
        const hyperlinkFeatures = this.extractHyperlinkFeatures(emlContent);
        const contentFeatures = this.extractContentFeatures(emlContent);

        return {
            headerFeatures,
            hyperlinkFeatures,
            contentFeatures,
            // Combine all features for TF-IDF processing
            allFeatures: {...headerFeatures, ...hyperlinkFeatures, ...contentFeatures}
        };
    }

    /**
     * Extract header features from email content
     * @param {string} emlContent - Raw content of the .eml file
     * @returns {Object} Header features
     */
    static extractHeaderFeatures(emlContent) {
        // Split email into header and body
        const parts = emlContent.split(/\r?\n\r?\n/, 2);
        const header = parts[0];

        // Extract various header fields
        const subject = this.extractHeaderField(header, 'Subject');
        const from = this.extractHeaderField(header, 'From');
        const to = this.extractHeaderField(header, 'To');
        const replyTo = this.extractHeaderField(header, 'Reply-To');
        const cc = this.extractHeaderField(header, 'Cc');
        const bcc = this.extractHeaderField(header, 'Bcc');
        const date = this.extractHeaderField(header, 'Date');
        const messageId = this.extractHeaderField(header, 'Message-ID');
        const xMailer = this.extractHeaderField(header, 'X-Mailer');
        const receivedCount = (header.match(/^Received:/gim) || []).length;

        // Domain info
        const fromDomain = this.extractEmailDomain(from);
        const replyToDomain = this.extractEmailDomain(replyTo);

        // Suspicious header patterns based on paper methodology
        const hasMismatchedDomains = replyTo && fromDomain !== replyToDomain;
        const hasUrgentSubject = /urgent|important|alert|verify|confirm|update|account|secure|suspend|verify/i.test(subject);
        const hasGenericGreeting = /dear user|dear customer|valued customer|account holder/i.test(emlContent);
        const hasMultipleReceivedHeaders = receivedCount > 3;

        return {
            subject,
            from,
            fromDomain,
            to,
            replyTo,
            replyToDomain,
            cc,
            bcc,
            date,
            messageId,
            xMailer,
            receivedCount,
            hasMismatchedDomains,
            hasUrgentSubject,
            hasGenericGreeting,
            hasMultipleReceivedHeaders
        };
    }

    /**
     * Extract hyperlink features from email content
     * @param {string} emlContent - Raw content of the .eml file
     * @returns {Object} Hyperlink features
     */
    static extractHyperlinkFeatures(emlContent) {
        // Extract all hyperlinks - both visible and href
        const visibleLinks = this.extractVisibleLinks(emlContent);
        const hrefLinks = this.extractHrefLinks(emlContent);

        // Find mismatches between visible and href URLs
        const mismatchedLinks = this.findMismatchedLinks(emlContent);

        // Calculate statistics
        const totalLinks = hrefLinks.length;
        const uniqueDomains = this.countUniqueDomains(hrefLinks);
        const avgUrlLength = this.calculateAvgLength(hrefLinks);
        const hasIPUrl = hrefLinks.some(url => /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i.test(url));
        const hasSuspiciousTLD = hrefLinks.some(url => {
            try {
                const domain = new URL(url).hostname;
                return /\.(tk|ml|ga|cf|gq|top|xyz|work|date|racing|win|review|stream|accountant)$/i.test(domain);
            } catch (e) {
                return false;
            }
        });

        return {
            visibleLinks,
            hrefLinks,
            mismatchedLinks,
            totalLinks,
            uniqueDomains,
            avgUrlLength,
            hasIPUrl,
            hasSuspiciousTLD,
            urlToTextRatio: emlContent.length > 0 ? totalLinks / emlContent.length : 0
        };
    }

    /**
     * Extract content-based features from email body
     * @param {string} emlContent - Raw content of the .eml file
     * @returns {Object} Content features
     */
    static extractContentFeatures(emlContent) {
        // Split email into header and body
        const parts = emlContent.split(/\r?\n\r?\n/, 2);
        const body = parts.length > 1 ? parts[1] : '';

        // Check for HTML content
        const hasHtmlContent = /<html|<body|<div|<table|<a\s|<img|<script/i.test(body);

        // Check for forms
        const hasForms = /<form|<input|<button|<select|<textarea/i.test(body);

        // Check for JavaScript
        const hasJavaScript = /<script|javascript:|onclick|onload|onmouseover/i.test(body);

        // Check for password or credential requests
        const requestsCredentials = /password|login|log in|sign in|credential|username|user name|account/i.test(body);

        // Check for urgency or threat language
        const hasUrgencyLanguage = /urgent|immediately|right away|expires|suspended|cancelled|verify now|limited time|alert/i.test(body);

        // Check for common phishing phrases
        const hasPhishingPhrases = /verify your account|security alert|unusual activity|confirm your information|update your information|account will be terminated|account has been limited/i.test(body);

        // Check for suspicious attachments
        const hasSuspiciousAttachments = /\.exe|\.zip|\.js|\.com|\.bat|\.scr|\.jar/i.test(body);

        // Text to HTML ratio
        const textContent = body.replace(/<[^>]*>/g, '');
        const textToHtmlRatio = hasHtmlContent ? textContent.length / body.length : 1;

        return {
            hasHtmlContent,
            hasForms,
            hasJavaScript,
            requestsCredentials,
            hasUrgencyLanguage,
            hasPhishingPhrases,
            hasSuspiciousAttachments,
            textToHtmlRatio,
            bodyLength: body.length,
            bodyTextLength: textContent.length
        };
    }

    /**
     * Extract a specific field from email header
     * @param {string} header - Email header content
     * @param {string} fieldName - Name of the header field to extract
     * @returns {string} Value of the header field
     */
    static extractHeaderField(header, fieldName) {
        const regex = new RegExp(`^${fieldName}:(.*)$`, 'im');
        const match = header.match(regex);
        return match ? match[1].trim() : '';
    }

    /**
     * Extract domain from email address
     * @param {string} emailField - Email address field
     * @returns {string} Domain part of the email
     */
    static extractEmailDomain(emailField) {
        const emailRegex = /<?([\w.-]+@[\w.-]+)>?/;
        const match = emailField.match(emailRegex);
        if (match) {
            const parts = match[1].split('@');
            return parts.length > 1 ? parts[1].toLowerCase() : '';
        }
        return '';
    }

    /**
     * Extract visible text links from email content
     * @param {string} emlContent - Raw content of the .eml file
     * @returns {Array} List of visible links
     */
    static extractVisibleLinks(emlContent) {
        const urlRegex = /https?:\/\/[^\s<>"]+|www\.[^\s<>"]+/g;
        const matches = emlContent.match(urlRegex) || [];
        return [...new Set(matches)]; // Remove duplicates
    }

    /**
     * Extract href links from email content
     * @param {string} emlContent - Raw content of the .eml file
     * @returns {Array} List of href links
     */
    static extractHrefLinks(emlContent) {
        const hrefRegex = /href=["'](https?:\/\/[^\s<>"]+|www\.[^\s<>"]+)["']/g;
        const links = [];
        let match;

        while ((match = hrefRegex.exec(emlContent)) !== null) {
            links.push(match[1]);
        }

        return [...new Set(links)]; // Remove duplicates
    }

    /**
     * Find mismatched links (where visible text differs from href)
     * @param {string} emlContent - Raw content of the .eml file
     * @returns {Array} List of mismatched links
     */
    static findMismatchedLinks(emlContent) {
        const anchorRegex = /<a\s+[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi;
        const mismatches = [];
        let match;

        while ((match = anchorRegex.exec(emlContent)) !== null) {
            const href = match[1];
            const displayText = match[2].replace(/<[^>]*>/g, '').trim();

            // If display text contains a URL that's different from href
            if (displayText.match(/https?:\/\/[^\s<>"]+|www\.[^\s<>"]+/)) {
                if (!this.urlsPointToSameDomain(displayText, href)) {
                    mismatches.push({
                        displayed: displayText,
                        actual: href
                    });
                }
            }
        }

        return mismatches;
    }

    /**
     * Check if two URLs point to the same domain
     * @param {string} url1 - First URL
     * @param {string} url2 - Second URL
     * @returns {boolean} True if URLs point to same domain
     */
    static urlsPointToSameDomain(url1, url2) {
        try {
            // Extract URLs if embedded in text
            const urlRegex = /(https?:\/\/[^\s<>"]+|www\.[^\s<>"]+)/;
            const match1 = url1.match(urlRegex);
            const match2 = url2.match(urlRegex);

            const extractedUrl1 = match1 ? match1[1] : url1;
            const extractedUrl2 = match2 ? match2[1] : url2;

            // Normalize URLs by adding https:// if missing
            const normalizedUrl1 = extractedUrl1.startsWith('http') ? extractedUrl1 : `https://${extractedUrl1}`;
            const normalizedUrl2 = extractedUrl2.startsWith('http') ? extractedUrl2 : `https://${extractedUrl2}`;

            // Extract domains
            const domain1 = new URL(normalizedUrl1).hostname;
            const domain2 = new URL(normalizedUrl2).hostname;

            // Compare domains without www prefix
            return domain1.replace(/^www\./, '') === domain2.replace(/^www\./, '');
        } catch (e) {
            // If URL parsing fails, return false
            return false;
        }
    }

    /**
     * Count unique domains in a list of URLs
     * @param {Array} urls - List of URLs
     * @returns {number} Number of unique domains
     */
    static countUniqueDomains(urls) {
        const domains = new Set();

        urls.forEach(url => {
            try {
                // Normalize URL by adding https:// if missing
                const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
                const domain = new URL(normalizedUrl).hostname.replace(/^www\./, '');
                domains.add(domain);
            } catch (e) {
                // Skip invalid URLs
            }
        });

        return domains.size;
    }

    /**
     * Calculate average length of URLs
     * @param {Array} urls - List of URLs
     * @returns {number} Average URL length
     */
    static calculateAvgLength(urls) {
        if (urls.length === 0) return 0;
        const totalLength = urls.reduce((sum, url) => sum + url.length, 0);
        return totalLength / urls.length;
    }

    /**
     * Calculate TF-IDF features for content analysis
     * This would typically involve more complex text processing
     * @param {string} emlContent - Raw content of the .eml file
     * @returns {Object} TF-IDF features
     */
    static calculateTfIdfFeatures(emlContent) {
        // In a real implementation, this would calculate TF-IDF scores
        // for words in the email to identify phishing indicators

        // For demonstration, we'll return a simplified version
        const commonPhishingTerms = [
            'account', 'update', 'verify', 'bank', 'password',
            'credit', 'information', 'click', 'confirm', 'secure'
        ];

        const termFrequency = {};

        commonPhishingTerms.forEach(term => {
            const regex = new RegExp(`\\b${term}\\b`, 'gi');
            const matches = emlContent.match(regex) || [];
            termFrequency[term] = matches.length;
        });

        return {
            termFrequency
        };
    }
}