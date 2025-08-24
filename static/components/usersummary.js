
export default {
  name: 'UserSummary',
  template: `
    <div class="container mt-4">
      <h4>📋 Your Quiz Summary</h4>
      
      <div class="row mt-3">
        <div class="col-md-4" v-for="(value, key) in summary" :key="key">
          <div class="card text-white bg-success mb-3">
            <div class="card-body">
              <h5 class="card-title">{{ key }}</h5>
              <p class="card-text display-6">{{ value }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-5">
        <div class="col-md-12">
          <canvas id="summaryChart" height="100"></canvas>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      summary: {
        'Attempted Quizzes': 0,
        'Correct Answers': 0,
        'Average Score (%)': 0
      }
    };
  },
  methods: {
    renderChart() {
      const ctx = document.getElementById('summaryChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(this.summary),
          datasets: [{
            label: 'Quiz Summary',
            data: Object.values(this.summary),
            backgroundColor: [
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)'
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  },
  async mounted() {
    const userId = localStorage.getItem('id');
    if (!userId) {
      alert("User not logged in!");
      return;
    }

    const res = await fetch(`/api/summary/user?user_id=${userId}`, {
      headers: {
        'Authentication-Token': localStorage.getItem('auth_token')
      }
    });

    if (res.ok) {
      const data = await res.json();
      this.summary = {
        'Attempted Quizzes': data.attempted,
        'Correct Answers': data.correct,
        'Average Score (%)': data.average
      };

      // Render chart after updating summary
      this.$nextTick(this.renderChart);
    } else {
      console.error('Failed to fetch user summary');
    }
  }
};
