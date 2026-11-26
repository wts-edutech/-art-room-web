export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getSession, checkIsAdmin } from '@/lib/api-auth';
import { getRequestContext } from '@cloudflare/next-on-pages';

export interface StudentPortfolioRecord {
  studentId: string;
  studentName: string;
  classroom: string;
  university: string;
  faculty: string;
  major: string;
  projectRound: string;
  gpax4: string;
  gpax5: string;
  entriesCount: number;
  status: 'draft' | 'submitted' | 'approved' | 'revision';
  teacherFeedback: string;
  portfolioJson: string;
  updatedAt: string;
}

const memoryPortfolios = new Map<string, StudentPortfolioRecord>();

async function getD1() {
  try {
    const ctx = getRequestContext();
    return ctx?.env?.DB || null;
  } catch {
    return null;
  }
}

async function ensurePortfoliosTable(d1: any) {
  if (!d1) return;
  try {
    await d1
      .prepare(`
        CREATE TABLE IF NOT EXISTS student_portfolios (
          student_id TEXT PRIMARY KEY,
          student_name TEXT NOT NULL,
          classroom TEXT DEFAULT '',
          university TEXT DEFAULT '',
          faculty TEXT DEFAULT '',
          major TEXT DEFAULT '',
          project_round TEXT DEFAULT '',
          gpax4 TEXT DEFAULT '',
          gpax5 TEXT DEFAULT '',
          entries_count INTEGER DEFAULT 0,
          status TEXT DEFAULT 'draft',
          teacher_feedback TEXT DEFAULT '',
          portfolio_json TEXT NOT NULL,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `)
      .run();
  } catch (err) {
    console.warn('ensurePortfoliosTable note:', err);
  }
}

function rowToRecord(row: any): StudentPortfolioRecord {
  return {
    studentId: row.student_id || row.studentId || '',
    studentName: row.student_name || row.studentName || '',
    classroom: row.classroom || '',
    university: row.university || '',
    faculty: row.faculty || '',
    major: row.major || '',
    projectRound: row.project_round || row.projectRound || '',
    gpax4: row.gpax4 || '',
    gpax5: row.gpax5 || '',
    entriesCount: Number(row.entries_count ?? row.entriesCount ?? 0),
    status: (row.status as any) || 'draft',
    teacherFeedback: row.teacher_feedback ?? row.teacherFeedback ?? '',
    portfolioJson: row.portfolio_json ?? row.portfolioJson ?? '{}',
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedId = (searchParams.get('studentId') || '').trim();
    const listAll = searchParams.get('all') === 'true';

    const isAdmin = await checkIsAdmin();
    const session = await getSession();

    // 1. Admin listing all student portfolios
    if (listAll) {
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Unauthorized — เฉพาะผู้ดูแลระบบ/ครูผู้สอนเท่านั้น' },
          { status: 401 }
        );
      }

      const d1 = await getD1();
      if (!d1) {
        return NextResponse.json(Array.from(memoryPortfolios.values()));
      }

      await ensurePortfoliosTable(d1);
      const stmt = d1.prepare(
        `SELECT student_id, student_name, classroom, university, faculty, major, project_round, gpax4, gpax5, entries_count, status, teacher_feedback, updated_at FROM student_portfolios ORDER BY updated_at DESC`
      );
      const res: any = await stmt.all();
      const rows = Array.isArray(res?.results) ? res.results : [];
      return NextResponse.json(
        rows.map((r: any) => ({
          ...rowToRecord({ ...r, portfolio_json: '{}' }),
          portfolioJson: undefined,
        }))
      );
    }

    // 2. Fetching a specific student's portfolio
    const targetId = isAdmin && requestedId ? requestedId : session?.role === 'student' ? session.userId : requestedId;

    if (!targetId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    // Security check: a student can ONLY read their own portfolio
    if (!isAdmin) {
      if (!session || session.role !== 'student' || String(session.userId).trim() !== String(targetId).trim()) {
        return NextResponse.json(
          { error: 'Forbidden — นักเรียนสามารถดูได้เฉพาะแฟ้มสะสมผลงานของตนเองเท่านั้น' },
          { status: 403 }
        );
      }
    }

    const d1 = await getD1();
    if (!d1) {
      const rec = memoryPortfolios.get(targetId) || null;
      return NextResponse.json({ record: rec });
    }

    await ensurePortfoliosTable(d1);
    const stmt = d1.prepare(`SELECT * FROM student_portfolios WHERE student_id = ?`).bind(targetId);
    const row: any = typeof stmt.first === 'function' ? await stmt.first() : (await stmt.all())?.results?.[0];

    if (!row) {
      return NextResponse.json({ record: null });
    }

    return NextResponse.json({ record: rowToRecord(row) });
  } catch (error) {
    console.error('GET /api/portfolios error:', error);
    return NextResponse.json({ error: 'Failed to load portfolio' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkIsAdmin();
    const session = await getSession();

    const body: any = await request.json().catch(() => ({}));
    const requestedStudentId = String(body.studentId || '').trim();
    const targetId = isAdmin && requestedStudentId ? requestedStudentId : session?.role === 'student' ? String(session.userId).trim() : requestedStudentId;

    if (!targetId) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบด้วยรหัสนักเรียนก่อนบันทึก' }, { status: 401 });
    }

    if (!isAdmin) {
      if (!session || session.role !== 'student' || String(session.userId).trim() !== targetId) {
        return NextResponse.json(
          { error: 'Forbidden — นักเรียนสามารถบันทึกได้เฉพาะแฟ้มสะสมผลงานของตนเองเท่านั้น' },
          { status: 403 }
        );
      }
    }

    const portfolioData = body.portfolio || {};
    const studentName = String(
      body.studentName ||
        portfolioData?.profile?.fullNameTh ||
        session?.name ||
        'นักเรียน'
    ).trim();
    const classroom = String(body.classroom || '').trim();
    const university = String(portfolioData?.university || '').trim();
    const faculty = String(portfolioData?.faculty || '').trim();
    const major = String(portfolioData?.major || '').trim();
    const projectRound = String(portfolioData?.projectRound || '').trim();
    const gpax4 = String(portfolioData?.profile?.gpax4 || '').trim();
    const gpax5 = String(portfolioData?.profile?.gpax5 || '').trim();
    const entriesCount = Array.isArray(portfolioData?.entries) ? portfolioData.entries.length : 0;
    const status = ['draft', 'submitted', 'approved', 'revision'].includes(body.status)
      ? body.status
      : 'draft';
    const updatedAt = new Date().toISOString();
    const portfolioJson = JSON.stringify(portfolioData);

    const d1 = await getD1();
    let existingFeedback = '';
    let existingStatus = status;

    if (d1) {
      await ensurePortfoliosTable(d1);
      const prevStmt = d1
        .prepare(`SELECT status, teacher_feedback FROM student_portfolios WHERE student_id = ?`)
        .bind(targetId);
      const prevRow: any =
        typeof prevStmt.first === 'function' ? await prevStmt.first() : (await prevStmt.all())?.results?.[0];
      if (prevRow) {
        existingFeedback = prevRow.teacher_feedback || '';
        if (!body.status && prevRow.status) {
          existingStatus = prevRow.status;
        }
      }

      const finalFeedback = body.teacherFeedback !== undefined ? String(body.teacherFeedback) : existingFeedback;
      const finalStatus = body.status ? status : existingStatus;

      await d1
        .prepare(
          `INSERT INTO student_portfolios (
            student_id, student_name, classroom, university, faculty, major, project_round,
            gpax4, gpax5, entries_count, status, teacher_feedback, portfolio_json, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(student_id) DO UPDATE SET
            student_name = excluded.student_name,
            classroom = CASE WHEN excluded.classroom != '' THEN excluded.classroom ELSE student_portfolios.classroom END,
            university = excluded.university,
            faculty = excluded.faculty,
            major = excluded.major,
            project_round = excluded.project_round,
            gpax4 = excluded.gpax4,
            gpax5 = excluded.gpax5,
            entries_count = excluded.entries_count,
            status = excluded.status,
            teacher_feedback = excluded.teacher_feedback,
            portfolio_json = excluded.portfolio_json,
            updated_at = excluded.updated_at`
        )
        .bind(
          targetId,
          studentName,
          classroom,
          university,
          faculty,
          major,
          projectRound,
          gpax4,
          gpax5,
          entriesCount,
          finalStatus,
          finalFeedback,
          portfolioJson,
          updatedAt
        )
        .run();
    } else {
      const prev = memoryPortfolios.get(targetId);
      memoryPortfolios.set(targetId, {
        studentId: targetId,
        studentName,
        classroom: classroom || prev?.classroom || '',
        university,
        faculty,
        major,
        projectRound,
        gpax4,
        gpax5,
        entriesCount,
        status: body.status || prev?.status || 'draft',
        teacherFeedback: body.teacherFeedback !== undefined ? String(body.teacherFeedback) : prev?.teacherFeedback || '',
        portfolioJson,
        updatedAt,
      });
    }

    return NextResponse.json({
      success: true,
      studentId: targetId,
      updatedAt,
    });
  } catch (error) {
    console.error('POST /api/portfolios error:', error);
    return NextResponse.json({ error: 'Failed to save portfolio' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized — เฉพาะผู้ดูแลระบบ/ครูผู้สอนเท่านั้น' },
        { status: 401 }
      );
    }

    const body: any = await request.json().catch(() => ({}));
    const studentId = String(body.studentId || '').trim();
    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    const status = ['draft', 'submitted', 'approved', 'revision'].includes(body.status)
      ? body.status
      : 'approved';
    const teacherFeedback = String(body.teacherFeedback ?? '').trim();
    const updatedAt = new Date().toISOString();

    const d1 = await getD1();
    if (d1) {
      await ensurePortfoliosTable(d1);
      await d1
        .prepare(
          `UPDATE student_portfolios SET status = ?, teacher_feedback = ?, updated_at = ? WHERE student_id = ?`
        )
        .bind(status, teacherFeedback, updatedAt, studentId)
        .run();
    } else {
      const prev = memoryPortfolios.get(studentId);
      if (prev) {
        memoryPortfolios.set(studentId, {
          ...prev,
          status,
          teacherFeedback,
          updatedAt,
        });
      }
    }

    return NextResponse.json({
      success: true,
      studentId,
      status,
      teacherFeedback,
      updatedAt,
    });
  } catch (error) {
    console.error('PUT /api/portfolios error:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized — เฉพาะผู้ดูแลระบบเท่านั้น' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const studentId = (searchParams.get('studentId') || '').trim();
    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    const d1 = await getD1();
    if (d1) {
      await ensurePortfoliosTable(d1);
      await d1.prepare(`DELETE FROM student_portfolios WHERE student_id = ?`).bind(studentId).run();
    } else {
      memoryPortfolios.delete(studentId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/portfolios error:', error);
    return NextResponse.json({ error: 'Failed to delete portfolio' }, { status: 500 });
  }
}
