# API 使用示例

## 📡 客户端调用示例

### JavaScript/TypeScript

```typescript
// 使用 fetch API
async function getRepositories() {
  try {
    const response = await fetch('http://localhost:3000/github/repositories');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const repositories = await response.json();
    console.log('用户仓库列表:', repositories);
    
    // 处理仓库数据
    repositories.forEach(repo => {
      console.log(`📁 ${repo.name} - ${repo.language} - ⭐${repo.stargazers_count}`);
    });
    
  } catch (error) {
    console.error('获取仓库失败:', error);
  }
}

// 使用 axios
import axios from 'axios';

async function getRepositoriesWithAxios() {
  try {
    const { data } = await axios.get('http://localhost:3000/github/repositories');
    return data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('GitHub token 未配置');
    } else if (error.response?.status === 400) {
      console.error('GitHub API 请求失败:', error.response.data.message);
    } else {
      console.error('请求失败:', error.message);
    }
    throw error;
  }
}
```

### Python

```python
import requests
import json

def get_repositories():
    """获取 GitHub 仓库列表"""
    url = "http://localhost:3000/github/repositories"
    
    try:
        response = requests.get(url)
        response.raise_for_status()  # 抛出 HTTP 错误
        
        repositories = response.json()
        print(f"找到 {len(repositories)} 个仓库:")
        
        for repo in repositories:
            print(f"📁 {repo['name']} - {repo.get('language', 'Unknown')} - ⭐{repo['stargazers_count']}")
            
        return repositories
        
    except requests.exceptions.RequestException as e:
        print(f"请求失败: {e}")
        return None

# 调用示例
if __name__ == "__main__":
    repos = get_repositories()
```

### cURL

```bash
# 基本请求
curl -X GET http://localhost:3000/github/repositories

# 格式化输出
curl -X GET http://localhost:3000/github/repositories | jq '.[0]'

# 检查响应头
curl -I http://localhost:3000/github/repositories

# 错误处理
curl -X GET http://localhost:3000/github/repositories -w "HTTP Status: %{http_code}\n"
```

## 🔧 前端集成示例

### React Hook

```tsx
import { useState, useEffect } from 'react';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
}

export function useGitHubRepositories() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepositories() {
      try {
        setLoading(true);
        const response = await fetch('/api/github/repositories');
        
        if (!response.ok) {
          throw new Error(`获取仓库失败: ${response.status}`);
        }
        
        const data = await response.json();
        setRepositories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    }

    fetchRepositories();
  }, []);

  return { repositories, loading, error };
}

// 使用示例组件
export function RepositoryList() {
  const { repositories, loading, error } = useGitHubRepositories();

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div>
      <h2>我的 GitHub 仓库 ({repositories.length})</h2>
      {repositories.map(repo => (
        <div key={repo.id} className="repo-card">
          <h3>
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
              {repo.name}
            </a>
          </h3>
          <p>{repo.description}</p>
          <div>
            <span>🔤 {repo.language}</span>
            <span>⭐ {repo.stargazers_count}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Vue.js 组件

```vue
<template>
  <div class="repository-list">
    <h2>我的 GitHub 仓库</h2>
    
    <div v-if="loading" class="loading">
      加载中...
    </div>
    
    <div v-else-if="error" class="error">
      错误: {{ error }}
    </div>
    
    <div v-else>
      <div v-for="repo in repositories" :key="repo.id" class="repo-card">
        <h3>
          <a :href="repo.html_url" target="_blank">{{ repo.name }}</a>
        </h3>
        <p>{{ repo.description }}</p>
        <div class="repo-meta">
          <span>🔤 {{ repo.language }}</span>
          <span>⭐ {{ repo.stargazers_count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Repository {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
}

const repositories = ref<Repository[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

async function fetchRepositories() {
  try {
    const response = await fetch('/api/github/repositories');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    repositories.value = await response.json();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取失败';
  } finally {
    loading.value = false;
  }
}

onMounted(fetchRepositories);
</script>
```

## 📊 数据处理示例

### 统计分析

```typescript
interface RepositoryStats {
  totalRepos: number;
  languages: Record<string, number>;
  totalStars: number;
  totalForks: number;
  mostStarredRepo: Repository;
}

function analyzeRepositories(repositories: Repository[]): RepositoryStats {
  const stats: RepositoryStats = {
    totalRepos: repositories.length,
    languages: {},
    totalStars: 0,
    totalForks: 0,
    mostStarredRepo: repositories[0]
  };

  repositories.forEach(repo => {
    // 统计编程语言
    if (repo.language) {
      stats.languages[repo.language] = (stats.languages[repo.language] || 0) + 1;
    }

    // 累计 stars 和 forks
    stats.totalStars += repo.stargazers_count;
    stats.totalForks += repo.forks_count;

    // 找到最受欢迎的仓库
    if (repo.stargazers_count > stats.mostStarredRepo.stargazers_count) {
      stats.mostStarredRepo = repo;
    }
  });

  return stats;
}

// 使用示例
async function showRepositoryStats() {
  const repositories = await getRepositories();
  const stats = analyzeRepositories(repositories);
  
  console.log(`📊 仓库统计:
    总仓库数: ${stats.totalRepos}
    总 Stars: ${stats.totalStars}
    总 Forks: ${stats.totalForks}
    最受欢迎: ${stats.mostStarredRepo.name} (${stats.mostStarredRepo.stargazers_count} stars)
    
    编程语言分布:
    ${Object.entries(stats.languages)
      .sort(([,a], [,b]) => b - a)
      .map(([lang, count]) => `    ${lang}: ${count}`)
      .join('\n')}
  `);
}
```

## 🔍 过滤和搜索

```typescript
// 按编程语言过滤
function filterByLanguage(repositories: Repository[], language: string) {
  return repositories.filter(repo => 
    repo.language?.toLowerCase() === language.toLowerCase()
  );
}

// 按名称搜索
function searchByName(repositories: Repository[], query: string) {
  const searchTerm = query.toLowerCase();
  return repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm) ||
    repo.description?.toLowerCase().includes(searchTerm)
  );
}

// 按 stars 排序
function sortByStars(repositories: Repository[], ascending = false) {
  return [...repositories].sort((a, b) => 
    ascending 
      ? a.stargazers_count - b.stargazers_count
      : b.stargazers_count - a.stargazers_count
  );
}

// 组合使用示例
async function findPopularTypeScriptRepos() {
  const allRepos = await getRepositories();
  const tsRepos = filterByLanguage(allRepos, 'TypeScript');
  const sortedRepos = sortByStars(tsRepos);
  
  console.log('最受欢迎的 TypeScript 仓库:');
  sortedRepos.slice(0, 5).forEach((repo, index) => {
    console.log(`${index + 1}. ${repo.name} - ⭐${repo.stargazers_count}`);
  });
}
```

这些示例展示了如何在不同环境中使用你的 GitHub API！