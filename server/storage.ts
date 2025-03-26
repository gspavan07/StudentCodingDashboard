import {
  users,
  type User,
  type InsertUser,
  students,
  type Student,
  type InsertStudent,
  codingProfiles,
  type CodingProfile,
  type InsertCodingProfile,
  feedback,
  type Feedback,
  type InsertFeedback,
  developers,
  type Developer,
  type InsertDeveloper,
  type StudentWithProfile,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Student operations
  getStudents(): Promise<Student[]>;
  getStudentsByBranchAndSection(
    branch: string,
    section: string,
  ): Promise<Student[]>;
  getStudentByRollNumber(rollNumber: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(
    id: number,
    student: Partial<InsertStudent>,
  ): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;
  deleteStudentByRollNumber(rollNumber: string): Promise<boolean>;
  deleteStudentsByBranch(branch: string): Promise<number>;
  deleteStudentsBySection(branch: string, section: string): Promise<number>;

  // Coding Profile operations
  getCodingProfile(studentId: number): Promise<CodingProfile | undefined>;
  createCodingProfile(profile: InsertCodingProfile): Promise<CodingProfile>;
  updateCodingProfile(
    studentId: number,
    profile: Partial<InsertCodingProfile>,
  ): Promise<CodingProfile | undefined>;
  getStudentWithProfile(
    rollNumber: string,
  ): Promise<StudentWithProfile | undefined>;
  bulkCreateOrUpdateStudentsWithProfiles(
    studentsWithProfiles: Array<
      InsertStudent & { profile: InsertCodingProfile }
    >,
  ): Promise<number>;

  // Feedback operations
  getFeedback(): Promise<Feedback[]>;
  createFeedback(feedbackData: InsertFeedback): Promise<Feedback>;

  // Developer operations
  getDevelopers(): Promise<Developer[]>;
  createDeveloper(developer: InsertDeveloper): Promise<Developer>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private students: Map<number, Student>;
  private codingProfiles: Map<number, CodingProfile>;
  private feedback: Map<number, Feedback>;
  private developers: Map<number, Developer>;
  private currentId: {
    users: number;
    students: number;
    codingProfiles: number;
    feedback: number;
    developers: number;
  };

  constructor() {
    this.users = new Map();
    this.students = new Map();
    this.codingProfiles = new Map();
    this.feedback = new Map();
    this.developers = new Map();
    this.currentId = {
      users: 1,
      students: 1,
      codingProfiles: 1,
      feedback: 1,
      developers: 1,
    };

    // Add admin user
    this.createUser({
      username: "admin",
      password: "$2b$10$dF8oQllmfC1KFlEkIBSP3uV7sKPi6sHSoBQahf97qm0pDEfYqfoAm", // hashed "admin123"
      isAdmin: true,
    });

    // Add a few sample developers
    this.createDeveloper({
      name: "Pavan Gollapalli",
      role: "Full Stack Developer",
      githubProfile: "https://github.com/gspavan07",
      bio: "Experienced developer with a passion for clean code and beautiful UIs.",
      imageUrl: "https://github.com/gspavan07.png",
      linkedinprofile: "https://www.linkedin.com/in/shanmukpavan-gollapalli/",
    });

    this.createDeveloper({
      name: "Sunil Garbana",
      role: "Backend Developer",
      githubProfile: "https://github.com/sunilgarbana",
      bio: "API specialist focused on scalable solutions.",
      imageUrl: "https://github.com/sunilgarbana.png",
      linkedinprofile: "https://www.linkedin.com/in/sunil-garbana-186376274/",
    });

    this.createDeveloper({
      name: "Kamal Sai Tillari",
      role: "Python Developer",
      githubProfile: "https://github.com/sunilgarbana",
      bio: "Expert Python developer specializing in data processing and automation solutions.",
      imageUrl: "https://github.com/kamalsai369.png",
      linkedinprofile: "https://www.linkedin.com/in/kamal-sai-tillari-445201268",

    });

    this.createDeveloper({
      name: "Tarun Sunkara",
      role: "Python Developer",
      githubProfile: "https://github.com/",
      bio: "Python developer focusing on data analysis implementations.",
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    // Ensure the isAdmin field is not undefined
    const user: User = {
      ...insertUser,
      id,
      isAdmin: insertUser.isAdmin ?? false,
    };
    this.users.set(id, user);
    return user;
  }

  // Student methods
  async getStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getStudentsByBranchAndSection(
    branch: string,
    section: string,
  ): Promise<Student[]> {
    return Array.from(this.students.values()).filter(
      (student) => student.branch === branch && student.section === section,
    );
  }

  async getStudentByRollNumber(
    rollNumber: string,
  ): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(
      (student) => student.rollNumber === rollNumber,
    );
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.currentId.students++;
    // Ensure the imageUrl field is not undefined
    const student: Student = {
      ...insertStudent,
      id,
      imageUrl: insertStudent.imageUrl ?? null,
    };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(
    id: number,
    updateData: Partial<InsertStudent>,
  ): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) {
      return undefined;
    }

    const updatedStudent = { ...student, ...updateData };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  async deleteStudent(id: number): Promise<boolean> {
    const deleted = this.students.delete(id);

    // Also delete associated coding profile if it exists
    const profiles = Array.from(this.codingProfiles.entries());
    for (const [profileId, profile] of profiles) {
      if (profile.studentId === id) {
        this.codingProfiles.delete(profileId);
        break;
      }
    }

    return deleted;
  }

  async deleteStudentByRollNumber(rollNumber: string): Promise<boolean> {
    // Find student by roll number
    const student = await this.getStudentByRollNumber(rollNumber);
    if (!student) {
      return false;
    }

    // Use existing method to delete student by ID
    return this.deleteStudent(student.id);
  }

  async deleteStudentsByBranch(branch: string): Promise<number> {
    let deletedCount = 0;

    // Get all students with specified branch
    const students = Array.from(this.students.values()).filter(
      (student) => student.branch === branch,
    );

    // Delete each student
    for (const student of students) {
      const deleted = await this.deleteStudent(student.id);
      if (deleted) {
        deletedCount++;
      }
    }

    return deletedCount;
  }

  async deleteStudentsBySection(
    branch: string,
    section: string,
  ): Promise<number> {
    let deletedCount = 0;

    // Get all students with specified branch and section
    const students = await this.getStudentsByBranchAndSection(branch, section);

    // Delete each student
    for (const student of students) {
      const deleted = await this.deleteStudent(student.id);
      if (deleted) {
        deletedCount++;
      }
    }

    return deletedCount;
  }

  // Coding Profile methods
  async getCodingProfile(
    studentId: number,
  ): Promise<CodingProfile | undefined> {
    return Array.from(this.codingProfiles.values()).find(
      (profile) => profile.studentId === studentId,
    );
  }

  async createCodingProfile(
    insertProfile: InsertCodingProfile,
  ): Promise<CodingProfile> {
    const id = this.currentId.codingProfiles++;
    // Use the proper schema fields directly
    const profile: CodingProfile = {
      ...insertProfile,
      hackerRankStarScore: insertProfile.hackerrank.starScore ?? null,
      hackerRankContests: insertProfile.hackerrank.contests ?? null,
      hackerRankStars: insertProfile.hackerrank.stars ?? null,
      leetCodeEasy: insertProfile.leetcode.easy ?? null,
      leetCodeMedium: insertProfile.leetcode.medium ?? null,
      leetCodeHard: insertProfile.leetcode.hard ?? null,
      leetCodeRank: insertProfile.leetcode.rank ?? null,
      leetCodeContests: insertProfile.leetcode.contests ?? null,
      codeChefTotalSolved: insertProfile.codechef.totalSolved ?? null,
      codeChefContests: insertProfile.codechef.contests ?? null,
      codeChefStars: insertProfile.codechef.stars ?? null,
      gfgSchool: insertProfile.gfg.school ?? null,
      gfgBasic: insertProfile.gfg.basic ?? null,
      gfgMedium: insertProfile.gfg.medium ?? null,
      gfgHard: insertProfile.gfg.hard ?? null,
      gfgScore: insertProfile.gfg.score ?? null,
    };
    this.codingProfiles.set(id, profile);
    return profile;
  }

  async updateCodingProfile(
    studentId: number,
    updateData: Partial<InsertCodingProfile>,
  ): Promise<CodingProfile | undefined> {
    const profile = Array.from(this.codingProfiles.values()).find(
      (profile) => profile.studentId === studentId,
    );

    if (!profile) {
      return undefined;
    }

    const updatedProfile = { ...profile, ...updateData };
    this.codingProfiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }

  async getStudentWithProfile(
    rollNumber: string,
  ): Promise<StudentWithProfile | undefined> {
    const student = await this.getStudentByRollNumber(rollNumber);
    if (!student) {
      return undefined;
    }

    const profile = await this.getCodingProfile(student.id);
    return {
      ...student,
      profile: profile || null,
    };
  }

  async bulkCreateOrUpdateStudentsWithProfiles(
    studentsWithProfiles: Array<
      InsertStudent & { profile: InsertCodingProfile }
    >,
  ): Promise<number> {
    let count = 0;

    for (const data of studentsWithProfiles) {
      const { profile: profileData, ...studentData } = data;

      // Check if student already exists
      let student = await this.getStudentByRollNumber(studentData.rollNumber);

      if (student) {
        // Update existing student
        student = (await this.updateStudent(
          student.id,
          studentData,
        )) as Student;
      } else {
        // Create new student
        student = await this.createStudent(studentData);
      }

      // Check if profile already exists
      let profile = await this.getCodingProfile(student.id);

      if (profile) {
        // Update existing profile
        await this.updateCodingProfile(student.id, {
          ...profileData,
          studentId: student.id,
        });
      } else {
        // Create new profile
        await this.createCodingProfile({
          ...profileData,
          studentId: student.id,
        });
      }

      count++;
    }

    return count;
  }

  // Feedback methods
  async getFeedback(): Promise<Feedback[]> {
    return Array.from(this.feedback.values());
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = this.currentId.feedback++;
    const feedbackEntry: Feedback = { ...insertFeedback, id };
    this.feedback.set(id, feedbackEntry);
    return feedbackEntry;
  }

  // Developer methods
  async getDevelopers(): Promise<Developer[]> {
    return Array.from(this.developers.values());
  }

  async createDeveloper(insertDeveloper: InsertDeveloper): Promise<Developer> {
    const id = this.currentId.developers++;
    // Ensure the bio field is not undefined
    const developer: Developer = {
      ...insertDeveloper,
      id,
      bio: insertDeveloper.bio ?? null,
      imageUrl: insertDeveloper.imageUrl ?? null,
    };
    this.developers.set(id, developer);
    return developer;
  }
}

export const storage = new MemStorage();
