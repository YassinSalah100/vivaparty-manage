import { EventInsert } from './event.service';

export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationService {
  static validateEvent(event: Partial<EventInsert>): ValidationError[] {
    const errors: ValidationError[] = [];

    // Title validation
    if (!event.title?.trim()) {
      errors.push({
        field: 'title',
        message: 'Event title is required'
      });
    } else if (event.title.length < 3) {
      errors.push({
        field: 'title',
        message: 'Event title must be at least 3 characters long'
      });
    }

    // Venue validation
    if (!event.venue?.trim()) {
      errors.push({
        field: 'venue',
        message: 'Venue is required'
      });
    }

    // Date validation
    if (!event.event_date) {
      errors.push({
        field: 'event_date',
        message: 'Event date is required'
      });
    } else {
      const eventDate = new Date(event.event_date);
      const now = new Date();
      if (eventDate < now) {
        errors.push({
          field: 'event_date',
          message: 'Event date must be in the future'
        });
      }
    }

    // Price validation
    if (typeof event.price !== 'number') {
      errors.push({
        field: 'price',
        message: 'Price must be a valid number'
      });
    } else if (event.price < 0) {
      errors.push({
        field: 'price',
        message: 'Price cannot be negative'
      });
    }

    // Total seats validation
    if (typeof event.total_seats !== 'number') {
      errors.push({
        field: 'total_seats',
        message: 'Total seats must be a valid number'
      });
    } else if (event.total_seats < 1) {
      errors.push({
        field: 'total_seats',
        message: 'Total seats must be at least 1'
      });
    }

    // Created by validation
    if (!event.created_by) {
      errors.push({
        field: 'created_by',
        message: 'User ID is required'
      });
    }

    // Image URL validation (optional)
    if (event.image_url && !isValidUrl(event.image_url)) {
      errors.push({
        field: 'image_url',
        message: 'Image URL must be a valid URL'
      });
    }

    return errors;
  }
}

// Helper function to validate URLs
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
