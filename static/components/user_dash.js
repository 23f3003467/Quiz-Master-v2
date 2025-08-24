import TakeQuizModal from './takequizmodal.js';


export default {
    template: `
      <div class="container mt-4">
        <h2>User Dashboard</h2>
  
        <table class="table table-hover mt-4">
          <thead class="table-dark">
            <tr>
              <th>Quiz Title</th>
              <th>Date</th>
              <th>No. of Questions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="quiz in quizzes" :key="quiz.id">
              <td>{{ quiz.title }}</td>
              <td>{{ quiz.date_of_quiz }}</td>
              <td>{{ quiz.questions.length }}</td>
              <td>
                <button class="btn btn-sm btn-info me-2" @click="viewQuiz(quiz)">View</button>
                <button class="btn btn-sm btn-success" @click="startQuiz(quiz)">Take Quiz</button>
              </td>
            </tr>
          </tbody>
        </table>
  
       <!-- 📋 Quiz Info Modal (Styled like EditChapterModal) -->
        <!-- 📋 View Quiz Info Modal -->
        <div v-if="selectedQuiz">
        <div class="modal fade show d-block" tabindex="-1" role="dialog" style="background-color: rgba(0,0,0,0.5);">
            <div class="modal-dialog" role="document">
            <div class="modal-content p-3">
                <h5 class="modal-title mb-3">📋 Quiz Details</h5>
                <p><strong>Title:</strong> {{ selectedQuiz.title }}</p>
                <p><strong>Chapter:</strong> {{ selectedQuiz.chapter?.name || 'N/A' }}</p>
                <p><strong>Date:</strong> {{ selectedQuiz.date_of_quiz }}</p>
                <p><strong>Duration:</strong> {{ selectedQuiz.time_duration }}</p>
                <p><strong>Remarks:</strong> {{ selectedQuiz.remarks || 'None' }}</p>
                <p><strong>No. of Questions:</strong> {{ selectedQuiz.questions?.length || 0 }}</p>

                <div class="text-end">
                <button class="btn btn-secondary" @click="selectedQuiz = null">Close</button>
                </div>
            </div>
            </div>
        </div>
        </div>
        <!-- 📋 Take Quiz Modal -->
         <TakeQuizModal
        :quizId="selectedQuizId"
        :show="showTakeQuizModal"
        @close="showTakeQuizModal = false"
        @submitted="fetchQuizzes"
        />

      </div>
    `,
    components: {
        TakeQuizModal
      },
    data() {
      return {
        quizzes: [],
        selectedQuiz: null,
        selectedQuizId: null,
        showTakeQuizModal: false
      };
    },
    async mounted() {
      await this.fetchQuizzes();
    },
    methods: {
      async fetchQuizzes() {
        const res = await fetch('/api/quizzes', {
          headers: {
            'Authentication-Token': localStorage.getItem('auth_token')
          }
        });
        if (res.ok) {
          this.quizzes = await res.json();
        }
      },
      viewQuiz(quiz) {
        this.selectedQuiz = quiz;
      },
      async startQuiz(quiz) {
        if(quiz.questions.length === 0) {
          alert('⚠️ This quiz has no questions!');
          return;
        }
        const quizId = quiz.id;
        const userId = localStorage.getItem('id'); // assuming you're storing it
        const res = await fetch(`/api/scores?user_id=${userId}&quiz_id=${quizId}`,
           {
          headers: {
            'Authentication-Token': localStorage.getItem('auth_token')
        }});
        const scores = await res.json();
        console.log(scores);
        if (scores.length > 0) {
          alert('⚠️ You have already attempted this quiz!');
          this.$emit('close');
          return;
        }

    
        // If not attempted, show the modal and pass quizId
        this.selectedQuizId = quizId;
        this.showTakeQuizModal = true;
      }
    }
  };
  