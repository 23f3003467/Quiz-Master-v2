import AddQuizModal from "./addquizmodal.js";
import EditQuizModal from "./editquizmodal.js";
import EditQuestionModal from "./editquestionmodal.js";

export default {
    template: `
      <div>
        <h2 class="mt-3">Quizzes</h2>
        <button class="btn btn-primary mb-3" @click="showAddQuizModal = true">+ Add Quiz</button>
        <div v-for="quiz in quizzes" :key="quiz.id" class="card my-3">
          <div class="card-body">
            <h4>{{ quiz.title }}</h4>
            <p><strong>Chapter:</strong> {{ quiz.chapter.name }}</p>
            <p><strong>Date:</strong> {{ quiz.date_of_quiz }} | <strong>Duration:</strong> {{ quiz.time_duration }}</p>
            <p><strong>Remarks:</strong> {{ quiz.remarks }}</p>
            
            <!-- 🧾 Questions Table -->
            <table class="table table-bordered mt-3">
              <thead>
                <tr>
                  <th>Question Statement</th>
                  <th>Correct Option</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="question in quiz.questions" :key="question.id">
                  <td>{{ question.question_statement }}</td>
                  <td>{{ question['option' + question.correct_option] }}</td>
                  <td>
                    <button class="btn btn-sm btn-warning me-1" @click="editQuestion(question)">Edit</button>
                    <button class="btn btn-sm btn-danger" @click="deleteQuestion(question.id)">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
  
            <!-- ➕ Add Question -->
            <div class="mt-3">
              <input v-model="newQuestions[quiz.id].question_statement" placeholder="Question Statement" class="form-control mb-1" required>
              <input v-model="newQuestions[quiz.id].option1" placeholder="Option 1" class="form-control mb-1" required>
              <input v-model="newQuestions[quiz.id].option2" placeholder="Option 2" class="form-control mb-1" required>
              <input v-model="newQuestions[quiz.id].option3" placeholder="Option 3" class="form-control mb-1" required>
              <input v-model="newQuestions[quiz.id].option4" placeholder="Option 4" class="form-control mb-1" required>
              <input v-model.number="newQuestions[quiz.id].correct_option" placeholder="Correct Option (1-4)" class="form-control mb-1">
              <button class="btn btn-sm btn-success" @click="addQuestion(quiz.id)">Add Question</button>
            </div>

          </div>
        </div>
            <!-- ➕ Add Quiz Modal -->
        <add-quiz-modal
            :show="showAddQuizModal"
            @close="showAddQuizModal = false"
            @success="fetchQuizzes"
        />

        <!-- ✏️ Edit Quiz Modal -->
        <edit-quiz-modal
            :show="showEditQuizModal"
            :quiz="editQuizData"
            @close="showEditQuizModal = false"
            @success="fetchQuizzes"
        />

        <!-- ✏️ Edit Question Modal -->
        <edit-question-modal
            :show="showEditQuestionModal"
            :question="editQuestionData"
            @close="showEditQuestionModal = false"
            @success="fetchQuizzes"
        />
      </div>
    `,
    data() {
      return {
        quizzes: [],
        newQuestions: {},
        showAddQuizModal: false,
        showEditQuestionModal:false,
        editQuestionData:null,
        showEditQuizModal: false,
        editQuizData: null
        
      };
    },
    async mounted() {
      await this.fetchQuizzes();

    },
    components: {
        'add-quiz-modal': AddQuizModal,
        'edit-quiz-modal': EditQuizModal,
        'edit-question-modal': EditQuestionModal
      },
      
    methods: {
      async fetchQuizzes() {
        const res = await fetch('/api/quizzes', {
          headers: {
            'Authentication-Token': localStorage.getItem('auth_token')
          }
        });
        const data = await res.json();
        this.quizzes = data;
        // console.log(this.quizzes);
  
        // Initialize newQuestions mapping
        data.forEach(quiz => {
          this.newQuestions[quiz.id] = {
            question_statement: '',
            option1: '',
            option2: '',
            option3: '',
            option4: '',
            correct_option: 1
          };
        });
        // console.log(this.newQuestions);
      },
      async addQuestion(quizId) {
        const q = this.newQuestions[quizId];
        console.log('nahi');
        // Validate question statement
        if (!q.question_statement.trim()) {
          return alert("Question statement is required!");
        }
      
        // Validate all 4 options
     // Validate all 4 options
      for (let i = 1; i <= 4; i++) {
        const val = (q[`option${i}`] || '').trim();
        if (!val) {
          return alert(`Option ${i} is required!`);
        }
      }

      
        // Validate correct option
        if (q.correct_option < 1 || q.correct_option > 4) {
          return alert("Correct option must be a number between 1 and 4.");
        }
      
        // Send to backend
        const res = await fetch('/api/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth_token')
          },
          body: JSON.stringify({
            ...q,
            quiz_id: quizId
          })
        });
      
        if (res.ok) {
          await this.fetchQuizzes();
        } else {
          alert("Failed to add question");
        }
      }
      ,
      async deleteQuestion(questionId) {
        if (!confirm("Delete this question?")) return;
        const res = await fetch(`/api/questions/${questionId}`, {
          method: 'DELETE',
          headers: {
            'Authentication-Token': localStorage.getItem('auth_token')
          }
        });
        if (res.ok) {
          await this.fetchQuizzes();
        } else {
          alert("Failed to delete question");
        }},
    editQuiz(quiz) {
      this.editQuizData = { ...quiz };
      this.showEditQuizModal = true;
    },
    editQuestion(q) {
      this.editQuestionData = { ...q };
    //   console.log(this.editQuestionData);
      this.showEditQuestionModal = true;
    }
  }
};
