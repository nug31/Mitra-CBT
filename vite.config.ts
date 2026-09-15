import react from '@vitejs/plugin-react'
import { defineConfig, Plugin } from 'vite'
import fs from 'fs'
import path from 'path'

function cbtSyncPlugin(): Plugin {
  const dataFile = path.resolve(process.cwd(), '.cbt_sync_data.json')

  const getInitialData = () => {
    const ahnafProfile = {
      id: 'profile-ahnaf',
      email: 'ahnaf@siswa.mitracbt.id',
      full_name: 'Ahnaf Engine',
      role: 'siswa',
      avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
      created_at: '2026-09-15T06:00:00.000Z'
    };

    const ahnafStudent = {
      id: 'student-ahnaf',
      profile_id: 'profile-ahnaf',
      nis: '10293847',
      nisn: '1029384756',
      class_id: 'cls-tkr-10',
      status: 'active',
      profile: ahnafProfile
    };

    const ahnafParticipant = {
      id: 'part-ahnaf-exam-01',
      exam_id: 'exam-01',
      student_id: 'student-ahnaf',
      status: 'force_submitted',
      score: 75,
      passed: true,
      tab_switch_count: 3,
      cheat_warning_count: 3,
      remaining_seconds: 0,
      start_time: '2026-09-15T06:00:00.000Z',
      finish_time: '2026-09-15T06:25:00.000Z',
      student: ahnafStudent
    };

    const ahnafResult = {
      id: 'res-ahnaf-exam-01',
      exam_id: 'exam-01',
      participant_id: 'part-ahnaf-exam-01',
      total_score: 75,
      max_possible_score: 100,
      percentage: 75,
      correct_count: 3,
      wrong_count: 1,
      unattempted_count: 0,
      passed: true,
      graded_at: '2026-09-15T06:25:00.000Z',
      participant: ahnafParticipant
    };

    const ahnafEvents = [
      {
        id: 'ev-ahnaf-5',
        exam_id: 'exam-01',
        participant_id: 'part-ahnaf-exam-01',
        event_type: 'FORCE_SUBMIT',
        details: { reason: 'Ujian dikunci otomatis karena melanggar batas maksimal buka tab / aplikasi (3x).', force_submitted: true },
        created_at: '2026-09-15T06:25:00.000Z',
        participant_name: 'Ahnaf Engine'
      },
      {
        id: 'ev-ahnaf-4',
        exam_id: 'exam-01',
        participant_id: 'part-ahnaf-exam-01',
        event_type: 'TAB_SWITCH',
        details: { count: 3, max: 3, time: '13:24:00' },
        created_at: '2026-09-15T06:24:00.000Z',
        participant_name: 'Ahnaf Engine'
      },
      {
        id: 'ev-ahnaf-3',
        exam_id: 'exam-01',
        participant_id: 'part-ahnaf-exam-01',
        event_type: 'TAB_SWITCH',
        details: { count: 2, max: 3, time: '13:20:00' },
        created_at: '2026-09-15T06:20:00.000Z',
        participant_name: 'Ahnaf Engine'
      },
      {
        id: 'ev-ahnaf-2',
        exam_id: 'exam-01',
        participant_id: 'part-ahnaf-exam-01',
        event_type: 'TAB_SWITCH',
        details: { count: 1, max: 3, time: '13:15:00' },
        created_at: '2026-09-15T06:15:00.000Z',
        participant_name: 'Ahnaf Engine'
      },
      {
        id: 'ev-ahnaf-1',
        exam_id: 'exam-01',
        participant_id: 'part-ahnaf-exam-01',
        event_type: 'START_EXAM',
        details: { total_questions: 4 },
        created_at: '2026-09-15T06:00:00.000Z',
        participant_name: 'Ahnaf Engine'
      }
    ];

    return {
      profiles: [ahnafProfile],
      students: [ahnafStudent],
      participants: [ahnafParticipant],
      exam_results: [ahnafResult],
      events: ahnafEvents
    };
  };

  const loadSyncStore = () => {
    try {
      if (fs.existsSync(dataFile)) {
        const raw = fs.readFileSync(dataFile, 'utf-8');
        const parsed = JSON.parse(raw);
        return parsed;
      }
    } catch (e) {
      console.error('[cbtSyncPlugin] Read error:', e);
    }
    const initial = getInitialData();
    saveSyncStore(initial);
    return initial;
  };

  const saveSyncStore = (data: any) => {
    try {
      fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('[cbtSyncPlugin] Write error:', e);
    }
  };

  return {
    name: 'cbt-sync-plugin',
    configureServer(server) {
      // Ensure file exists with initial data on server boot
      loadSyncStore();

      server.middlewares.use((req, res, next) => {
        console.log('[cbtSyncPlugin] request:', req.method, req.url);
        if (!req.url?.startsWith('/api/cbt-sync')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method === 'GET') {
          const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
          const key = url.searchParams.get('key');
          const store = loadSyncStore();
          if (key) {
            res.end(JSON.stringify({ data: store[key] || null }));
          } else {
            res.end(JSON.stringify({ data: store }));
          }
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body || '{}');
              const store = loadSyncStore();
              if (payload.key && payload.data !== undefined) {
                store[payload.key] = payload.data;
              } else if (payload.batch) {
                Object.assign(store, payload.batch);
              }
              saveSyncStore(store);
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cbtSyncPlugin()],
  server: {
    host: true,
  },
})

