/**
 * Structured error response format
 * Based on ChartBrew error patterns and REST best practices
 */

export type ErrorCode = 
  | "VALIDATION_ERROR" 
  | "SCHEMA_ERROR" 
  | "TEMPLATE_ERROR" 
  | "SERVER_ERROR"
  | "INVALID_WEBHOOK_DATA"
  | "FIELD_MAPPING_ERROR";

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiError {
  error: {
    code: ErrorCode;
    message: string;
    details?: ApiErrorDetail[];
  };
}