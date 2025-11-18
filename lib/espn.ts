export interface Game {
    id: string
    homeTeam: string
    awayTeam: string
    homeTeamLogo?: string
    awayTeamLogo?: string
    gameDate: string
    league: string
    status: string
  }
  
  export async function getUpcomingGames(league: 'nba' | 'nfl' | 'mlb' = 'nba'): Promise<Game[]> {
    try {
      const response = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/${
          league === 'nba' ? 'basketball/nba' :
          league === 'nfl' ? 'football/nfl' :
          'baseball/mlb'
        }/scoreboard`
      )
  
      if (!response.ok) throw new Error('Failed to fetch games')
  
      const data = await response.json()
  
      const games: Game[] = data.events.map((event: any) => ({
        id: event.id,
        homeTeam: event.competitions[0].competitors.find((c: any) => c.homeAway === 'home')?.team.displayName || 'TBD',
        awayTeam: event.competitions[0].competitors.find((c: any) => c.homeAway === 'away')?.team.displayName || 'TBD',
        homeTeamLogo: event.competitions[0].competitors.find((c: any) => c.homeAway === 'home')?.team.logo,
        awayTeamLogo: event.competitions[0].competitors.find((c: any) => c.homeAway === 'away')?.team.logo,
        gameDate: event.date,
        league: league.toUpperCase(),
        status: event.status.type.name,
      }))
  
      return games
    } catch (error) {
      console.error('Error fetching games:', error)
      return []
    }
  }