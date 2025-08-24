export default {
    name: "UserScores",
    template: `
      <div class="container mt-4">
        <h3 class="mb-3">📊 My Quiz Scores</h3>
        <table class="table table-bordered">
          <thead class="thead-dark">
            <tr>
              <th>Quiz Title</th>
              <th>Total Questions</th>
              <th>Correct Answers</th>
              <th>Score</th>
              <th>Time Taken (sec)</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="score in scores" :key="score.id">
              <td>{{ score.quiz.title }}</td>
              <td>{{ score.total_questions }}</td>
              <td>{{ score.correct_answers }}</td>
              <td>{{ score.total_score }}</td>
              <td>{{ score.duration_taken }}</td>
              <td>{{ ((score.correct_answers / score.total_questions) * 100).toFixed(2) }}%</td>
            </tr>
          </tbody>
        </table>
        <div v-if="scores.length === 0" class="text-center mt-3 text-muted">
          No quiz attempts found.
        </div>
      </div>
    `,
    data() {
      return {
        scores: []
      };
    },
    async mounted() {
      await this.loadScores();
    },
    methods: {
      async loadScores() {
        const userId = localStorage.getItem('id');
        // console.log("Fetching scores for user ID:", userId);
        try {
          const res = await fetch(`/api/scores?user_id=${userId}`, {
            headers: {
              'Authentication-Token': localStorage.getItem('auth_token')
            }
          });
          if (res.ok) {
            const data = await res.json();
            this.scores = data;
            console.log("Scores loaded:", this.scores);
          } else {
            alert("Failed to fetch scores.");
          }
        } catch (err) {
          console.error("Error loading scores:", err);
          alert("Error fetching scores.");
        }
      }
    }
  };
  