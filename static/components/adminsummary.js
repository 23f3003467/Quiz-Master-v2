export default {
    name: 'AdminSummary',
    template: `
      <div class="container mt-4">
      <button @click="create_csv"> Get Score Data </button>
        <h3>📊 Admin Dashboard Summary</h3>
        <div class="row text-center mt-4">
          <div class="col-md-3" v-for="(value, label) in summary" :key="label">
            <div class="card shadow-sm mb-3">
              <div class="card-body">
                <h5>{{ label }}</h5>
                <p class="display-6">{{ value }}</p>
              </div>
            </div>
          </div>
        </div>
        <canvas id="adminChart"></canvas>
      </div>
    `,
    data() {
      return {
        summary: {
          Users: 0,
          Quizzes: 0,
          Questions: 0,
          Attempts: 0
        }
      };
    },
    async mounted() {
      const res = await fetch('/api/summary/admin', {
        headers: {
          'Authentication-Token': localStorage.getItem('auth_token')
        }
      });
      const data = await res.json();
      this.summary = {
        Users: data.users-1,
        Quizzes: data.quizzes,
        Questions: data.questions,
        Attempts: data.attempts
      };
      this.renderChart();
    },
    methods: {
      async create_csv(){
        const res = await fetch(location.origin + '/create-csv',{
          headers: {
            'Authentication-Token': localStorage.getItem('auth_token')
          }
        })
        const task_id = (await res.json()).task_id

        const interval = setInterval(async() => {
            const res = await fetch(`${location.origin}/get-csv/${task_id}` )
            if (res.ok){
                console.log('data is ready')
                window.open(`${location.origin}/get-csv/${task_id}`)
                clearInterval(interval)
            }

        }, 100)
        
    },
      renderChart() {
        const ctx = document.getElementById('adminChart').getContext('2d');
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Object.keys(this.summary),
            datasets: [{
              label: 'Admin Stats',
              data: Object.values(this.summary),
              backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#dc3545']
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: true, text: 'Overall Platform Stats' }
            }
          }
        });
      }
    }
  };
  