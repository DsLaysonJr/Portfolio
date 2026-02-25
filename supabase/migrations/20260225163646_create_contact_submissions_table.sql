/*
  # Create contact submissions table

  1. New Tables
    - `contact_submissions`
      - `id` (uuid, primary key) - Unique identifier
      - `name` (text) - Visitor's name
      - `email` (text) - Visitor's email address
      - `subject` (text) - Message subject
      - `message` (text) - Message content
      - `created_at` (timestamp) - When the message was received
      - `read` (boolean) - Whether the message has been read
  
  2. Security
    - Enable RLS on `contact_submissions` table
    - Add policy allowing anyone to insert submissions
    - Add policy allowing only authenticated admin to read submissions
*/

CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read boolean DEFAULT false
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to submit contact form"
  ON contact_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Disable public read access to submissions"
  ON contact_submissions
  FOR SELECT
  USING (false);
