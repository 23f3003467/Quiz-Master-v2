export default {
    name: 'AddQuizModal',
    props: ['show'],
    data() {
      return {
        chapters: [], // holds chapter list from API
        quiz: {
          title: '',
          chapter_id: '',
          date_of_quiz: '',
          time_duration: '',
          remarks: ''
        }
      };
    },
    watch: {
      show(val) {
        if (val) {
          this.fetchChapters();
        }
      }
    },
   
    template: `
    <div v-if="show">
    <div class="modal fade show d-block" tabindex="-1" role="dialog" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog" role="document">
        <div class="modal-content p-3">
           <h5 class="modal-title mb-3">➕ Add New Quiz</h5>
  
    <input v-model="quiz.title" class="form-control mb-2" placeholder="Quiz Title" />

    <select v-model="quiz.chapter_id" class="form-control mb-2">
      <option disabled value="">Select Chapter</option>
      <option v-for="chap in chapters" :key="chap.id" :value="chap.id">
        {{ chap.name }} (ID: {{ chap.id }})
      </option>
    </select>

    <input v-model="quiz.date_of_quiz" class="form-control mb-2" type="date" />
    <input v-model="quiz.time_duration" class="form-control mb-2" placeholder="Duration (HH:MM)" />
    <textarea v-model="quiz.remarks" class="form-control mb-3" placeholder="Remarks"></textarea>

    <div class="text-end">
      <button class="btn btn-success me-2" @click="submit">Add</button>
      <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
    </div>
        </div>
      </div>
    </div>
  </div>
    `,
    methods: {
      async fetchChapters() {
        const res = await fetch('/api/chapters', {
          headers: {
            'Authentication-Token': localStorage.getItem('auth_token')
          }
        });
        if (res.ok) {
          this.chapters = await res.json();
        } else {
          alert("Failed to fetch chapters");
        }
      },
      async submit() {
        const res = await fetch('/api/quizzes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth_token')
          },
          body: JSON.stringify(this.quiz)
        });
        if (res.ok) {
          this.$emit('success');
          this.$emit('close');
          this.resetForm();
      
          // Trigger Celery task for quiz notification
          await fetch('/quiz_notifier', {
            method: 'GET',
            headers: {
              'Authentication-Token': localStorage.getItem('auth_token')
            }
          });
        } else {
          alert("Failed to add quiz");
        }
      },
      resetForm() {
        this.quiz = {
          title: '',
          chapter_id: '',
          date_of_quiz: '',
          time_duration: '',
          remarks: ''
        };
      }
    }
  };
  