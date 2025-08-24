export default {
  name: 'EditChapterModal',
  props: ['show', 'chapter'],
  data() {
    return {
      localChapter: { id: null, name: '', description: '', subject_id: null }
    };
  },
  watch: {
    chapter: {
      immediate: true,
      handler(newVal) {
        this.localChapter = { ...newVal };
      }
    }
  },
  template: `
    <div v-if="show">
      <div class="modal fade show d-block" tabindex="-1" role="dialog" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog" role="document">
          <div class="modal-content p-3">
            <h5 class="modal-title">Edit Chapter</h5>
            <input v-model="localChapter.name" class="form-control mb-2" placeholder="Chapter name" />
            <textarea v-model="localChapter.description" class="form-control mb-2" placeholder="Description"></textarea>
            <div class="text-end">
              <button class="btn btn-success me-2" @click="submit">Save</button>
              <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  methods: {
    async submit() {
      const res = await fetch(`/api/chapters/${this.localChapter.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': localStorage.getItem('auth_token')
        },
        body: JSON.stringify({
          name: this.localChapter.name,
          description: this.localChapter.description,
          subject_id: this.localChapter.subject_id
        })
      });
      if (res.ok) {
        this.$emit('success');
        this.$emit('close');
      } else {
        alert('Failed to update chapter');
      }
    }
  }
};
