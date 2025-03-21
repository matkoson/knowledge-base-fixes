// database.test.ts
import { test, expect, beforeAll, afterAll } from 'bun:test';
import { DatabaseManager, ZshSection } from './database_manager';
import { setupTestDatabase, cleanupTestDatabase } from './db_test_setup';

let dbPath: string;
let dbManager: DatabaseManager;

beforeAll(async () => {
  // Setup test database
  dbPath = await setupTestDatabase('test-database.db');
  dbManager = new DatabaseManager(dbPath);
});

afterAll(async () => {
  // Clean up
  dbManager.close();
  await cleanupTestDatabase(dbPath);
});

test('DatabaseManager - insert and retrieve section', () => {
  // Arrange
  const testSection: ZshSection = {
    title: 'Test Insert',
    content: 'This is a test section for insertion',
    source: 'test_insert.html',
    section_type: 'h2'
  };
  
  // Act
  const insertedId = dbManager.insertSection(testSection);
  const retrievedSection = dbManager.getSection(insertedId);
  
  // Assert
  expect(insertedId).toBeGreaterThan(0);
  expect(retrievedSection).not.toBeNull();
  expect(retrievedSection?.title).toBe(testSection.title);
  expect(retrievedSection?.content).toBe(testSection.content);
  expect(retrievedSection?.source).toBe(testSection.source);
  expect(retrievedSection?.section_type).toBe(testSection.section_type);
});

test('DatabaseManager - get all sections', () => {
  // Arrange
  const testSections: ZshSection[] = [
    {
      title: 'Section 1',
      content: 'Content 1',
      source: 'source1.html',
      section_type: 'h1'
    },
    {
      title: 'Section 2',
      content: 'Content 2',
      source: 'source2.html',
      section_type: 'h2'
    }
  ];
  
  // Act
  testSections.forEach(section => dbManager.insertSection(section));
  const allSections = dbManager.getAllSections();
  
  // Assert
  expect(allSections.length).toBeGreaterThanOrEqual(testSections.length);
  
  // Check if all test sections are in the returned data
  testSections.forEach(testSection => {
    const found = allSections.some(section => 
      section.title === testSection.title &&
      section.content === testSection.content
    );
    expect(found).toBe(true);
  });
});

test('DatabaseManager - search sections', () => {
  // Arrange
  const uniqueTestSection: ZshSection = {
    title: 'Unique Search Test',
    content: 'This content has a unique identifier XYZABC123',
    source: 'search_test.html',
    section_type: 'h3'
  };
  
  dbManager.insertSection(uniqueTestSection);
  
  // Act
  const searchResults = dbManager.searchSections('XYZABC123');
  
  // Assert
  expect(searchResults.length).toBeGreaterThan(0);
  expect(searchResults[0].title).toBe(uniqueTestSection.title);
  expect(searchResults[0].content).toBe(uniqueTestSection.content);
});

test('DatabaseManager - handle parent-child relationships', () => {
  // Arrange
  const parentSection: ZshSection = {
    title: 'Parent Section',
    content: 'Parent Content',
    source: 'parent.html',
    section_type: 'h1'
  };
  
  // Act
  const parentId = dbManager.insertSection(parentSection);
  
  const childSection: ZshSection = {
    title: 'Child Section',
    content: 'Child Content',
    source: 'child.html',
    section_type: 'h2',
    parent_id: parentId
  };
  
  const childId = dbManager.insertSection(childSection);
  const retrievedChild = dbManager.getSection(childId);
  
  // Assert
  expect(retrievedChild).not.toBeNull();
  expect(retrievedChild?.parent_id).toBe(parentId);
});