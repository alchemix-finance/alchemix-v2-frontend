import { flarum } from '@stores/flarum';
import axios from 'axios';

const slugUrl = 'https://forum.alchemix.fi/public/d/';
const queryUrl = 'https://forum.alchemix.fi/public/api/discussions?filter%5Btag%5D=aip';

export const fetchPosts = async () => {
  await axios.get(queryUrl).then((result) => {
    const filteredPosts = result.data.data
      .map((post) => {
        return {
          id: post.id,
          title: post.attributes.title,
          url: `${slugUrl}${post.attributes.slug}`,
          posts: post.attributes.lastPostNumber,
          created: post.attributes.createdAt,
          lastPost: post.attributes.lastPostedAt,
        };
      })
      .slice(0, 5);
    flarum.set({
      fetching: false,
      posts: [...filteredPosts],
    });
    return true;
  });
};
