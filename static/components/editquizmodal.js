export default {
    name: 'EditQuizModal',
    props: ['show', 'quiz'],
    data() {
      return {
        quizData: {}
      };
    },
    watch: {
      quiz: {
        immediate: true,
        handler(newVal) {
          this.quizData = { ...newVal };
        }
      }
    },
    template: `
      <div v-if="show" class="modal-backdrop">
        <div class="modal">
          <h5>Edit Quiz</h5>
          <input v-model="quizData.title" class="form-control mb-2" placeholder="Title" />
          <input v-model="quizData.chapter_id" class="form-control mb-2" placeholder="Chapter ID" type="number" />
          <input v-model="quizData.date_of_quiz" class="form-control mb-2" type="date" />
          <input v-model="quizData.time_duration" class="form-control mb-2" placeholder="Duration (HH:MM)" />
          <textarea v-model="quizData.remarks" class="form-control mb-2" placeholder="Remarks"></textarea>
          <div class="text-end">
            <button class="btn btn-success" @click="submit">Update</button>
            <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
          </div>
        </div>
      </div>
    `,
    methods: {
      async submit() {
        const res = await fetch(`/api/quizzes/${this.quizData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth_token')
          },
          body: JSON.stringify(this.quizData)
        });
        if (res.ok) {
          this.$emit('success');
          this.$emit('close');
        } else {
          alert("Failed to update quiz");
        }
      }
    }
  };
  