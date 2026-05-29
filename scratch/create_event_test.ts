import { createDefaultEventForUser } from '@/app/eventActions';

(async () => {
  try {
    const event = await createDefaultEventForUser('test@example.com');
    console.log('Created event:', event.id, event.slug);
  } catch (e) {
    console.error('Error creating event:', e);
  }
})();
